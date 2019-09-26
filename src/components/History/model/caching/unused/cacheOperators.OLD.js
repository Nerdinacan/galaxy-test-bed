/**
 * Exposes caching operations as rxjs operators for
 * use in the streams which run polling, manual
 * requesting and live query generation.
 */

import { pipe, of, from } from "rxjs";
import { tap, pluck, map, reduce, mergeMap } from "rxjs/operators";
import { history$, historyContent$, dataset$, datasetCollection$ } from "./db";
import { prepareHistory, prepareContentSummary,
    prepareDataset, prepareDatasetCollection } from "./prepare";
import { getItem, setItem, deleteItem } from "./genericOperators";

// import { create } from "rxjs-spy";
// import { tag } from "rxjs-spy/operators";
// window.spy = create();



// load item from cache by source: primary key

// Note: These functions return a live observable, if you
// just want one value, convert to promise, do a take(1)
// or use the config.live = false flag

export const getCachedHistory = (config = {}) => pipe(
    getItem({ ...config, collection$: history$ })
)

export const getCachedContent = (config = {}) => pipe(
    getItem({ ...config, collection$: historyContent$ })
)

export const getCachedDataset = (config = {}) => pipe(
    getItem({ ...config, collection$: dataset$ })
)

export const getCachedDatasetCollection = (config = {}) => pipe(
    getItem({ ...config, collection$: datasetCollection$ })
)



// Store pased item (prepare then cache)

export const cacheHistory = (config = {}) => pipe(
    map(prepareHistory),
    setItem({ ...config, collection$: history$ })
)

export const cacheContent = (config = {}) => pipe(
    map(prepareContentSummary),
    setItem({ ...config, collection$: historyContent$ })
)

export const cacheDataset = (config = {}) => pipe(
    map(prepareDataset),
    // also refresh content
    tap(ds => of(ds).pipe(cacheContent(config)).subscribe()),
    setItem({ ...config, collection$: dataset$ })
)

export const cacheDatasetCollection = (config = {}) => pipe(
    map(prepareDatasetCollection),
    // also refresh content
    tap(dsc => of(dsc).pipe(cacheContent(config)).subscribe()),
    setItem({ ...config, collection$: datasetCollection$ })
)



// Remove source item from history

export const deleteHistory = () => pipe(
    deleteItem(history$)
)

export const deleteContent = () => pipe(
    deleteItem(historyContent$)
)

export const deleteDataset = () => pipe(
    deleteItem(dataset$)
)

export const deleteDatasetCollection = () => pipe(
    deleteItem(datasetCollection$)
)



// Loads a list of content from an iterable of type-ids
// Return an observable that we will probably turn into
// a promise

export const loadContentByTypeIds = () => pipe(
    map(contentSet => Array.from(contentSet)),
    mergeMap(contentArray => from(contentArray)),
    getCachedContent({ live: false }),
    reduce((acc, content) => ([...acc, content]), [])
)
