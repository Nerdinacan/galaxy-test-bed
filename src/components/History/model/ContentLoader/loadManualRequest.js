import { of, Subject, merge } from "rxjs";
import { tap, mergeMap, share, map, withLatestFrom } from "rxjs/operators";
import { ajaxGet, firstItem, split } from "utils/observable";
import { cacheContent } from "../caching/operators";
import { SearchParams } from "../SearchParams";


/**
 * Rxjs operator that turns params + contents into a series of ajax
 * requests that populate the rxDB database based on UI interaction
 *
 * the src$ should be a combination of the current params and the
 * rendered content on the UI, i.e. combineLatest(param$, content$)
 */
export const loadManualRequest = () => initialParam$ => {

    // input stream for secondary requests for large param ranges. We'll break
    // down large requests into smaller chunked segments that we can
    // cache or decide to skip as necessary
    const nextParam$ = new Subject();

    // merge initial param request with follow-up requests
    const requestParam$ = merge(initialParam$, nextParam$).pipe(
        map(p => p.chunk()), // reset limit to pagesize for this chunk
        share()
    )

    return requestParam$.pipe(

        // build request url, return an empty array instead of requesting
        // if we already did it.
        map(buildContentUrl),
        previousUrlFilter(),

        // compare to initial params, send next chunk if results haven't
        // reached the end of the initially requested range of results
        withLatestFrom(initialParam$, requestParam$),
        tap(([ results, initialParams, lastParams ]) => {
            if ((lastParams.skip + lastParams.limit) < initialParams.limit) {
                // move skip down
                nextParam$.next(lastParams.nextPage());
            }
        }),

        // split results into a stream of individual updates
        firstItem(),
        split(),
        cacheContent()
    )
}


/**
 * Generates request url for a given set of request parameters.
 * Takes one page worth of results from the "end" point down
 */
export const buildContentUrl = params => {

    const base = `/api/histories/${params.historyId}/contents?context=manual&v=dev&view=summary`;
    const extraKeys = "keys=accessible"; // move into summary?
    const order = "order=hid-dsc";

    // let endClause = "";
    // if (params.end && params.end < Number.POSITIVE_INFINITY) {
    //     endClause = `q=hid-le&qv=${params.end}`;
    // }

    const skipClause = `offset=${params.skip}`;
    const limitClause = `limit=${SearchParams.pageSize}`;

    let deletedClause = "", purgedClause = "";
    if (!params.showDeleted) {
        // limit to non-deleted
        deletedClause = `q=deleted&qv=False`;
        purgedClause = `q=purged&qv=False`;
    }

    let visibleClause = "";
    if (!params.showHidden) {
        // limit to visible
        visibleClause = `q=visible&qv=True`;
    }

    const textFilter = params.textFilter ? `q=name-contains&qv=${textFilter}` : "";

    const parts = [
        base, extraKeys, order,
        skipClause, limitClause,
        deletedClause, purgedClause,
        visibleClause, textFilter
    ];

    return parts.filter(o => o.length).join("&");
}


/**
 * If this URL was already sent in this session, skip it, the polling
 * mechanism will pick up any relevant updates.
 * @param {String} baseUrl
 */
export const previousUrlFilter = (storage = new Set()) => url$ => {

    // Kind of like a normal rxjs distinct, but we want to return
    // an empty array if the url is not distinct instead of just filtering

    return url$.pipe(
        mergeMap(url => {
            return storage.has(url) ? of([]) : of(url).pipe(
                ajaxGet(),
                tap(storage.add(url))
            )
        })
    )
}



// Unused now, save for later

/**
 * Tacks on an update_time criteria to an outgoing URL so we can
 * limit responses to just stuff that's changed since we looked last
 * @param {String} baseUrl Basic request url without update_time filter
 */
// export const addUpdateCriteria = url => {
//     const lastRequested = requestDateStore.getItem(url);
//     if (lastRequested) {
//         return `${url}&q=update_time-gt&qv=${lastRequested}`;
//     }
//     return url;
// }
