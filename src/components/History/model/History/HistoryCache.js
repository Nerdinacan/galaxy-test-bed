import { merge, Observable } from "rxjs";
import { filter, map, switchMap, mergeMap, share, distinctUntilChanged } from "rxjs/operators";
import { split, createInputFunction } from "utils/observable";
import moment from "moment";

import { getHistories } from "../queries";
import { getCollection } from "../caching/db";
import { cacheHistory, uncacheHistory } from "../caching/operators";



// Input Function/observables for CRUD updates, adds and removes history
// objects from indexDB. createInputFunction creates a function that when
// run, emits the value on an attached observable (.$)

export const addHistoryToCache = createInputFunction();
export const deleteHistoryFromCache = createInputFunction();


/**
 * Monitors changes to the history cache for the source user id
 */
export const HistoryCache = () => userId$ => {

    // rxdb query object for this user id
    const query$ = userId$.pipe(
        filter(Boolean),
        distinctUntilChanged(),
        mergeMap(async id => {
            const coll = await getCollection('history');
            return coll.find().where("user_id").eq(id);
        }),
        share()
    )

    // Live history query. Just stares at IndexDB and emits the
    // histories for this user id
    const Histories$ = query$.pipe(
        switchMap(query => query.$),
        map(docs => docs.map(d => d.toJSON()))
    )

    const loadedHistories$ = query$.pipe(
        mergeMap(loadFreshHistories),
        split()
    )

    const add$ = merge(loadedHistories$, addHistoryToCache.$).pipe(
        cacheHistory()
    )

    const remove$ = deleteHistoryFromCache.$.pipe(
        uncacheHistory()
    )

    // return a single observable that subscribes all 3 streams
    // so the consumer doesn't have to micromanage subscriptions
    return new Observable(observer => {

        const sub = Histories$.subscribe(observer);

        sub.add(add$.subscribe({
            error: err => console.warn("error adding history", err.message)
        }));

        sub.add(remove$.subscribe({
            error: err => console.warn("error removing history", err.message)
        }));

        return sub;
    })
}


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
