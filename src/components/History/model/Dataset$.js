import { of, zip, pipe, combineLatest, forkJoin, from } from "rxjs";
import { tap, filter, map, pluck, share, take } from "rxjs/operators";
import { getCachedContent, getCachedDataset, cacheDataset, updateDocFields } from "./caching";
import { ajaxGet } from "utils/observable";
import { safeAssign } from "utils/safeAssign";
import { updateContentFields } from "./queries";


/**
 * Generates a datset observable from source content. Updates self if dataset
 * data is too stale.
 * @param {*} content$
 */
export function Dataset$(content$) {

    // lookup function that takes content and
    // finds the dataset we're looking for,
    // typically one of the "getCachedX" functions
    const lookupFn = () => pipe(
        pluck('id'),
        getCachedDataset({ live: false })
    );

    return content$.pipe(
        tap(checkForUpdates({
            debug: false,
            lookupFn,
            storeFn: cacheDataset
        })),
        pluck("id"),
        getCachedDataset(),
    )
}



/**
 * Side effect, looks at the content, compares with a lookup dataset or dataset
 * collection. If that collection is stale, retrieves a new version from server
 * and caches it locally. Configuration allows for customization of the lookup
 * and cache operators, but in practice it'll probably just be a combination of
 * the standard cacheDataset/getDataset functions.
 */
export const checkForUpdates = config => c => {

    const { lookupFn, storeFn, debug = false } = config;

    const content$ = of(c);

    const existingCachedData$ = content$.pipe(
        lookupFn(debug)
    )

    // check to see if the existing cached data is older than the content index data
    const stale$ = zip(content$, existingCachedData$).pipe(
        filter(([ content, existingItem ]) => {
            if (!existingItem) return true;
            return existingItem.getUpdateDate().isBefore(content.getUpdateDate());
        }),
        map(inputs => inputs[0])
    )

    const retrievedVersion$ = stale$.pipe(
        pluck('url'),
        ajaxGet(),
        storeFn({ debug })
    )

    retrievedVersion$.subscribe({
        next: item => console.log("checkForUpdates", item),
        error: err => console.warn("checkForUpdates error", err),
        complete: () => console.log("checkForUpdates complete")
    });
}


// This function actually works for both datasets and collections

export function updateDataset(data, inputFields) {

    const data$ = of(data);

    const content$ = data$.pipe(
        pluck('type_id'),
        getCachedContent({ live: false })
    )

    // ajax call to update fields
    const savePromise = updateContentFields(data, inputFields);
    const savedFields$ = from(savePromise).pipe(
        map(updated => {
            const target = Object.assign({}, inputFields);
            return safeAssign(target, updated)
        }),
        take(1),
        share()
    )

    // cache in dataset/datasetCollection rxdb collection
    const cachedData$ = combineLatest(data$, savedFields$).pipe(
        updateDocFields()
    )

    // cache in content summary
    const cachedContent$ = combineLatest(content$, savedFields$).pipe(
        updateDocFields()
    )

    // wait for both updates
    return forkJoin([ cachedData$, cachedContent$ ])
}
