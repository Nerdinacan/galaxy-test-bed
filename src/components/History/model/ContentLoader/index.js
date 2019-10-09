import { defer, of, from, Observable } from "rxjs";
import { tap, share, shareReplay, takeUntil, take } from "rxjs/operators";
import polling from 'rx-polling';

import { createInputFunction } from "utils/observable";
import { contentObservable } from "./contentObservable";
import { loadManualRequest } from "./loadManualRequest";
import { buildPollRequest } from "./buildPollRequest";



/**
 * Creates a subject and function to stop polling, primarily for debugging purposes.
 */
export const stopPolling = createInputFunction();


/**
 * Returns a combined subscription to three observables:
 *
 * content$:
 * A direct subscription to an observable that updates the history
 * content for the passed id. This is what's viewed in the ContentList.vue
 *
 * manual$
 * Responds to parameter changes in the store to load new content as the user
 * filters and paginates through the content list. The request parameters are
 * (currently) housed in the store, though I still maintain that they would be
 * better represented as local state in the History vue components. Vuex is only
 * getting in the way here.
 *
 * poll$
 * Periodically requests updates to the history. Updates are cached in the
 * background and need not be something that the user is currently looking at. I
 * also believe this mechanism will eliminate the need for other polling
 * operations in galaxy since the history object itself is cached as well as new
 * or updated contents.
 */
export const ContentLoader = (config = {}) => incomingParam$ => {

    const {
        suppressPolling = false,
        suppressManualLoad = false,
        pollInterval = 10000
    } = config;

    // share this
    const param$ = incomingParam$.pipe(
        shareReplay(1)
    )

    // observable that renders content in the list, just
    // stares directly at the db for this history
    const content$ = param$.pipe(
        contentObservable()
    )

    // ajax requests instantiated by filtering/pagination changes
    // combineLatest(param$, content$)
    const manual$ = param$.pipe(
        loadManualRequest()
    )

    // periodic updates, updates to this history independent of what the
    // user is looking at, just depends on the history
    const pollRequest$ = defer(() => param$.pipe(buildPollRequest()));
    const poll$ = polling(pollRequest$, {
        interval: pollInterval
    }).pipe(
        takeUntil(stopPolling.$)
    )


    return new Observable(observer => {

        // Standard subscribe handlers apply to content observable,
        // but we also subscribe to the manual/polling observables
        // to keep them running while the history panel is open
        const sub = content$.subscribe(observer);

        // when params change, loads next page/params
        if (!suppressManualLoad) {
            const manualSub = manual$.subscribe({
                // next: val => console.log("manual result", val),
                complete: () => console.log("manual complete"),
                error: err => {
                    if (err.rxdb) rxdbErrorHandler(err);
                }
            });
            sub.add(manualSub);
        }

        // catches non-ui updates to history. Server side changes, etc.
        if (!suppressPolling) {
            const pollSub = poll$.subscribe({
                next: val => console.log("poll result", val),
                complete: () => console.log("polling complete"),
                error: err => {
                    if (err.rxdb) rxdbErrorHandler(err);
                }
            });
            sub.add(pollSub);
        }

        return sub;
    })

}


// Make error more useful since the author of RxDB coulnd't be bothered.

function rxdbErrorHandler(err) {

    console.groupCollapsed("rxdbErrorHandler");
    console.dir(err);
    console.groupEnd();

    const { obj, schema } = err.parameters;

    if (obj && schema && schema.properties) {

        console.warn(`schema mismatch in ${schema.title}?`);

        const objectKeys = Object.keys(obj);
        const schemaKeys = Object.keys(schema.properties);

        const diff1 = objectKeys.filter(x => !schemaKeys.includes(x));
        console.log("keys in object, not in schema", diff1);

        const diff2 = schemaKeys.filter(x => !objectKeys.includes(x));
        console.log("keys in schema, not in object", diff2);
    }
}