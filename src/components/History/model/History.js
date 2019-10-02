import { pipe, merge, Observable } from "rxjs";
import { tap, filter, map, switchMap, mergeMap, pluck } from "rxjs/operators";
import { split, createInputFunction } from "utils/observable";
import moment from "moment";

import {
    cacheHistory,
    uncacheHistory
} from "./caching/operators";

import {
    getCollection
} from "./caching/db";

import {
    getHistories,
    createHistory,
    deleteHistoryById,
    cloneHistory,
    secureHistory,
    updateHistoryFields as updateProps
} from "./queries";



/**
 * Monitors changes to the history cache for the source user id
 */
export const HistoryCache = () => userId$ => {

    // Live history query. Just stares at IndexDB and emits the
    // histories for this user id
    const Histories$ = userId$.pipe(
        buildLiveHistoryQuery()
    )

    // changes to the history list from CRUD, server events, etc.
    const update$ = userId$.pipe(
        buildUpdateStreams()
    )

    // return a single observable that subscribes all 3 streams
    // so the consumer doesn't have to micromanage subscriptions
    return new Observable(observer => {
        const sub = Histories$.subscribe(observer);
        const updateSub = update$.subscribe({
            // next: update => console.log("history update", update.id),
            error: err => console.warn("error updating history", err.message)
        });
        sub.add(updateSub);
        return sub;
    })
}


// Input Function/observables for CRUD updates, adds and removes history
// objects from indexDB. createInputFunction creates a function that when
// run, emits the value on an attached observable (.$)

export const addHistoryToCache = createInputFunction();
export const deleteHistoryFromCache = createInputFunction();



// generates live query of histories for a user id
// source stream: observable user id

export const buildLiveHistoryQuery = () => pipe(
    historyCacheQuery(),
    tap(query => console.log("query", query.mquery)),
    switchMap(query => query.$), // live updates
    // filter out local rxdb records that have been flagged for deletion
    map(docs => docs.filter(c => !c.deleted)),
    // tap(async docs => {
    //     if (!docs.length) {
    //         // if no results, need to generate a new one
    //         const freshHistory = await createHistory();
    //         if (freshHistory) {
    //             console.log("making new history");
    //             addHistoryToCache(freshHistory);
    //         }
    //     }
    // }),
    filter(docs => docs.length),
    map(docs => docs.map(d => d.toJSON()))
)


// rxjs operator for generating the local history RxDB query for a given user id
// source stream: observable user id

export const historyCacheQuery = (config = {}) => {
    const { collName = 'history' } = config;
    return pipe(
        mergeMap(async userId => {
            const coll = await getCollection(collName);
            return coll.find().where("user_id").eq(userId);
        })
    )
}




// Build handle changes to the list, cache new elements, remove deleted ones

export const buildUpdateStreams = () => userId$ => {

    const loadedHistories$ = userId$.pipe(
        loadUserHistories(),
        split()
    )

    const add$ = merge(loadedHistories$, addHistoryToCache.$).pipe(
        cacheHistory()
    )

    const remove$ = deleteHistoryFromCache.$.pipe(
        uncacheHistory()
    )

    return merge(add$, remove$);
}


// initial load of histories, reloads when user changes

export const loadUserHistories = () => pipe(
    historyCacheQuery(),
    mergeMap(loadFreshHistories)
)


// load fresh history, checks existing histories for
// latest update_time and only loads newer data

export async function loadFreshHistories(rxdbQuery) {
    const existing = await rxdbQuery.exec();
    const updateTime = historyLastChanged(existing);
    return await getHistories(updateTime);
}


// get the latest history update_time to reduce update query
// preserves server-side non-standard ISO date format

export const historyLastChanged = list => {
    return list.reduce((latestVal, h) => {
        const existingDate = moment.utc(latestVal);
        const thisDate = moment.utc(h.update_time);
        return thisDate > existingDate ? h.update_time : latestVal;
    }, moment.utc(0).toISOString());
}




/**
 * History CRUD operations
 * Not in store because they don't touch the state directly.
 * Just do the ajax and dump the new history into the appropriate
 * queue (addHistoryToCache or deleteHistoryFromCache)
 */

export async function createNewHistory() {
    console.log("createNewHistory");
    const newHistory = await createHistory();
    addHistoryToCache(newHistory);
    return newHistory;
}

export async function copyHistory(history, name, copyWhat) {
    console.log("copyHistory");
    const newHistory = await cloneHistory(history, name, copyWhat);
    addHistoryToCache(newHistory);
    return newHistory;
}

export async function deleteHistory(history, purge = false) {
    console.log("deleteHistory");
    const doomed = await deleteHistoryById(history.id, purge);
    console.log("doomed", doomed);
    deleteHistoryFromCache(doomed);
    return doomed;
}

export async function makeHistoryPrivate(history) {
    console.log("makeHistoryPrivate");
    const newHistory = await secureHistory(history.id);
    addHistoryToCache(newHistory);
    return newHistory;
}

export async function updateHistoryFields(history, fields) {
    console.log("updateHistoryFields");
    const updatedHistory = await updateProps(history, fields);
    addHistoryToCache(updatedHistory);
    return updatedHistory;
}
