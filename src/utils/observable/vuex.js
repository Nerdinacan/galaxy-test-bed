/**
 * Operator that watches a vuex store given a source selector function
 * Source observable input is the selector function input for the store.watch method
 */

import { Observable, pipe } from "rxjs";
import { switchMap } from "rxjs/operators";

export const watchVuexSelector = config => {

    const {
        store,
        watchOptions = { immediate: true }
    } = config;

    return pipe(
        switchMap(selectorFn => {
            return new Observable(subscriber => {
                const callback = result => subscriber.next(result);
                return store.watch(selectorFn, callback, watchOptions);
            });
        })
    )
}
