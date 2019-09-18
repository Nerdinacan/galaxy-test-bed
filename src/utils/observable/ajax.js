/**
 * Ajax observables customized to galaxy. Prepand configuration api paths,
 * apply general error handling and retries, etc.
 */

import { BehaviorSubject } from "rxjs";
import { tap, map, mergeMap } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { prependPath } from "utils/redirect";


// loading indicator
export const ajaxLoading = new BehaviorSubject(false);


export const ajaxGet = () => url$ => {
    return url$.pipe(
        tap(() => ajaxLoading.next(true)),
        mergeMap(ajax.getJSON),
        tap(() => ajaxLoading.next(false))
    );
}


export const ajaxLoad = () => config$ => {
    return config$.pipe(
        map(config => ({
            ...config,
            url: prependPath(config.url)
        })),
        tap(() => ajaxLoading.next(true)),
        mergeMap(ajax),
        tap(() => ajaxLoading.next(false))
    )
}