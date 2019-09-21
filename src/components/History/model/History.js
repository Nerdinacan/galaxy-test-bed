import { pipe, merge, Observable } from "rxjs";
import { tap, filter, map, switchMap, mergeMap } from "rxjs/operators";
import { split, createInputFunction } from "utils/observable";
import moment from "moment";

import {
    history$ as historyCollection$,
    withLatestFromDb,
    cacheHistory,
    deleteHistory as wipeCachedHistory
} from "./caching";

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
            // next: update => console.log("history update", update),
            error: err => console.warn("error updating history", err)
        });
        sub.add(updateSub);
        return sub;
    })
}


// Input Function/observables for CRUD updates, adds and removes history
// objects from indexDB. createInputFunction creates a function that when
// run, emits the value on an attached observable (.$)

export const addToHistoryCache = createInputFunction();
export const deleteHistoryFromCache = createInputFunction();


// generates live query of histories for a user id
// source stream: observable user id

export const buildLiveHistoryQuery = () => pipe(
    historyCacheQuery(),
    switchMap(query => query.$), // live updates
    tap(async docs => {
        if (!docs.length) {
            // if no results, need to generate a new one
            const freshHistory = await createHistory();
            addToHistoryCache(freshHistory);
        }
    }),
    filter(docs => docs.length),
    map(docs => docs.map(d => d.toJSON()))
)


// rxjs operator for generating the local history RxDB query for a given user id
// source stream: observable user id

export const historyCacheQuery = (config = {}) => {

    const {
        collection = historyCollection$,
    } = config;

    return pipe(
        withLatestFromDb(collection),
        map(([id, coll]) => coll.find().where("user_id").eq(id))
    )
}




// Build handle changes to the list, cache new elements, remove deleted ones

export const buildUpdateStreams = () => userId$ => {

    // load histories by user id
    const loadedHistories$ = userId$.pipe(
        loadUserHistories()
    )

    // added histories get cached
    const add$ = merge(loadedHistories$, addToHistoryCache.$).pipe(
        cacheHistory()
    )

    // removed histories get wiped
    const remove$ = deleteHistoryFromCache.$.pipe(
        wipeCachedHistory()
    )

    return merge(add$, remove$);
}


// initial load of histories, reloads when user changes

export const loadUserHistories = () => pipe(
    historyCacheQuery(),
    mergeMap(loadFreshHistories),
    split()
)


// load fresh history, checks existing histories for
// latest update_time and only loads newer data

export const loadFreshHistories = async (rxdbQuery) => {
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
 * History operatons
 * Not in store because they don't touch the state directly.
 * Updates happen through the direct subscription to HistoryCache
 */

export async function createNewHistory() {
    const newHistory = await createHistory();
    addToHistoryCache(newHistory);
    return newHistory;
}

export async function copyHistory(history, name, copyWhat) {
    const newHistory = await cloneHistory(history, name, copyWhat);
    addToHistoryCache(newHistory);
    return newHistory;
}

export async function deleteHistory(history, purge = false) {
    await deleteHistoryById(history.id, purge);
    deleteHistoryFromCache(history);
    return history;
}

export async function makeHistoryPrivate(history) {
    const newHistory = await secureHistory(history.id);
    addToHistoryCache(newHistory);
    return newHistory;
}

export async function updateHistoryFields(history, fields) {
    const updatedHistory = await updateProps(history, fields);
    addToHistoryCache(updatedHistory);
    return updatedHistory;
}
