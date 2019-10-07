/**
 * Just exposes the promises from caching as operators so they
 * can be more easily used in the RxJS streams that manage content
 */

import { pipe, from } from "rxjs";
import { mergeMap, retryWhen, filter, take } from "rxjs/operators";

// caching promises
import * as p from "./index";

// convert named promise function to operator for export
const toOperator = fnName => {
    const fn = p[fnName];
    if (undefined === fn) {
        throw new Error(`undefined promise function: ${fnName}`);
    }
    if (!(fn instanceof Function)) {
        throw new Error(`indicated import is not a function`);
    }
    return () => pipe(
        mergeMap(src => fn(src))
    )
}

export const cacheHistory = toOperator("cacheHistory");
export const getHistory = toOperator("getHistory");
export const uncacheHistory = toOperator("uncacheHistory");

export const cacheContent = toOperator("cacheContent");
export const getContent = toOperator("getContent");
export const uncacheContent = toOperator("uncacheContent");

export const cacheDataset = toOperator("cacheDataset");
export const getDataset = toOperator("getDataset");
export const uncacheDataset = toOperator("uncacheDataset");

export const cacheDatasetCollection = toOperator("cacheDatasetCollection");
export const getDatasetCollection = toOperator("getDatasetCollection");
export const uncacheDatasetCollection = toOperator("uncacheDatasetCollection");


// Update a doc with just a few fields
export const updateDocFields = () => {

    return pipe(
        mergeMap(([ doc, changedFields ]) => {
            const p = doc.update({ $set: changedFields })
                .then(() => {
                    // am not sure why this doesn't return anything
                    // useful from the promise, but we'll return the
                    // RxDB document.
                    return doc;
                });
            return from(p);
        }),
        retryWhen(err => err.pipe(
            filter(err => err.name == "conflict"),
            take(1)
        ))
    )
}


