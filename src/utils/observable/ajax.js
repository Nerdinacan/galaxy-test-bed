/**
 * Ajax observables customized to galaxy. Prepand configuration api paths,
 * apply general error handling and retries, etc.
 */

import { Subject, merge } from "rxjs";
import { tap, map, mergeMap, scan, mapTo, startWith } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { prependPath } from "utils/redirect";


// loading indicator
const isLoading = new Subject();
const loading$ = isLoading.pipe(mapTo(1));
const notLoading = new Subject;
const unloading$ = notLoading.pipe(mapTo(-1));
export const ajaxLoading = merge(loading$, unloading$).pipe(
    scan((acc, val) => Math.max(acc + val, 0), 0),
    startWith(0),
    map(val => val > 0)
)

export const ajaxGet = () => url$ => {
    return url$.pipe(
        tap(() => isLoading.next(1)),
        mergeMap(ajax.getJSON),
        tap(() => notLoading.next(1))
    );
}

export const ajaxLoad = () => config$ => {
    return config$.pipe(
        map(config => ({
            ...config,
            url: prependPath(config.url)
        })),
        tap(() => isLoading.next(1)),
        mergeMap(ajax),
        tap(() => notLoading.next(1))
    )
}