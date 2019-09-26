import { pipe } from "rxjs";
import { tap, map, filter, pluck } from "rxjs/operators";
import { getContent, getDatasetCollection, cacheDatasetCollection } from "./caching/operators";
import { checkForUpdates } from "./Dataset$";
import DscWrapper from "./DscWrapper";
// import { tag } from "rxjs-spy/operators";

/**
 * Takes an observable of a type_id, looks up the associated content.
 * Refreshes the collection object if it is stale i.e.
 * (content.update_time > collection.update_time)
 * @param {Observable<string>} id$
 */
export function DatasetCollection$(id$) {

    // used in checkForUpdates, gets most recent
    // collection data by id, returns only one
    // value since this gets called in a tap()
    const lookupFn = () => pipe(
        pluck('id'),
        getDatasetCollection(),
    )

    const content$ = id$.pipe(

        // get content observable from id
        getContent(),

        // use content, compare update_times, get fresh
        // collection if the existing dataset collection
        // is absent or older than the content.update_time
        tap(checkForUpdates({
            debug: false,
            lookupFn,
            storeFn: cacheDatasetCollection
        }))
    )

    return content$.pipe(
        pluck("id"),
        getDatasetCollection(),
        filter(Boolean),
        map(doc => doc.toJSON()),
        map(object => new DscWrapper({ object })),
    )
}

