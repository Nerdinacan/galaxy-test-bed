import { of, pipe, merge } from "rxjs";
import { tap, filter, map, share, pluck, distinctUntilChanged,
    switchMap, mergeMap } from "rxjs/operators";
import { split, createInputFunction, watchVuexSelector } from "utils/observable";
import { history$ as hColl$, withLatestFromDb,
    cacheHistory, deleteHistory } from "./caching";
import { getHistories, createHistory } from "./queries";
import moment from "moment";


// Functions for CRUD updates, adds and removes history objects from indexDB

export const addToHistoryCache = createInputFunction();
export const deleteHistoryFromCache = createInputFunction();


// Observable monitors changes in user, then modifies live query to indexDB, and dumps
// the results into the store

export const listenToHistoryCache = store => {

    const { commit } = store;
    const { Histories$, add$, remove$ } = buildObservables(store);

    // transfers results of the history query to the store
    const sub = Histories$.subscribe({
        next: list => commit("history/setHistories", list),
        error: err => console.warn("Histories$, error", err)
    })

    // holds subscription to add/remove and initial loading
    const updateSub = merge(add$, remove$).subscribe({
        next: update => console.log("history update", update),
        error: err => console.warn("error updating history", err)
    })

    return sub.add(updateSub);
}


/**
 * Create observables, can't just define them on the page since
 * the CurrentUserId depends on the store, and doing so
 * would result in a circular reference problem, so we define them
 * in a function and subscribe to them when we initialize the store
 */
const buildObservables = store => {

    // Watch current user by looking at store
    const fnSelector = state => state.user.currentUser;
    const CurrentUserId$ = of(fnSelector).pipe(
        watchVuexSelector({ store }),
        filter(Boolean),
        pluck('id'),
        distinctUntilChanged(),
        share()
    )

    // History query changes when user changes
    const Histories$ = CurrentUserId$.pipe(
        userHistoryQuery(),
        switchMap(query => query.$),
        tap(async docs => {
            // if no results, need to make a new one
            if (!docs.length) {
                const freshHistory = await createHistory();
                addToHistoryCache(freshHistory);
            }
        }),
        filter(docs => docs.length),
        map(docs => docs.map(d => d.toJSON()))
    )

    // initial load of histories, changes when user changes
    const loadedHistories$ = CurrentUserId$.pipe(
        userHistoryQuery(),
        mergeMap(loadFreshHistories),
        split()
    )

    // added histories get cached
    const add$ = merge(loadedHistories$, addToHistoryCache.$).pipe(
        cacheHistory()
    )

    // removed histories get wiped
    const remove$ = deleteHistoryFromCache.$.pipe(
        deleteHistory()
    )

    return { Histories$, add$, remove$ };
}


// rxjs operator for generating the local history database query for a given ID

const userHistoryQuery = () => pipe(
    withLatestFromDb(hColl$),
    map(([id, coll]) => coll.find().where("user_id").eq(id))
)


// load fresh history, checkes existing histories for
// latest update_time and only loads newer data

const loadFreshHistories = async (query) => {
    const existingHistories = await query.exec();
    const latestUpdateTime = historyLastChanged(existingHistories);
    return await getHistories(latestUpdateTime);
}


// get the latest history update_time to reduce update query
// preserves server-side non-standard ISO date format

const historyLastChanged = list => {
    return list.reduce((latestVal, h) => {
        const existingDate = moment.utc(latestVal);
        const thisDate = moment.utc(h.update_time);
        return thisDate > existingDate ? h.update_time : latestVal;
    }, moment.utc(0).toISOString());
}
