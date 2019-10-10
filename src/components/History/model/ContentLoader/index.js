import { defer, Observable } from "rxjs";
import { shareReplay, takeUntil } from "rxjs/operators";
import polling from 'rx-polling';

import { createInputFunction } from "utils/observable";
import { contentObservable } from "./contentObservable";
import { loadManualRequest } from "./loadManualRequest";
import { buildPollRequest } from "./buildPollRequest";



/**
 * Creates a subject and function to stop polling, primarily for debugging.
 */
export const stopPolling = createInputFunction();


/**
 * ContentLoader
 * Rxjs operator accepts user parameters and returns a combined subscription
 * to three observables:
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

    // suppress settings are primarily for debugging
    const {
        suppressPolling = false,
        suppressManualLoad = false,
        interval = 5000
    } = config;

    // share params because we subscribe to it multiple times
    const param$ = incomingParam$.pipe(shareReplay(1));

    // this is the resultant content for the current params
    // this gets sent to the UI
    const content$ = param$.pipe(contentObservable());

    // when the user changes the params we may have to load new content
    const manual$ = param$.pipe(loadManualRequest());

    // when the server updates, update the cache. Can merge this with a websocket
    // observable when we implement realtime updates
    const pollRequest$ = defer(() => param$.pipe(buildPollRequest()));
    const poll$ = polling(pollRequest$, { interval }).pipe(
        takeUntil(stopPolling.$)
    )

    return new Observable(observer => {

        const sub = content$.subscribe(observer);

        if (!suppressManualLoad) {
            const manualSub = manual$.subscribe({
                // next: val => console.log("manual result", val),
                // complete: () => console.log("manual complete"),
                error: err => {
                    if (err.rxdb) {
                        rxdbErrorHandler(err)
                    } else {
                        console.warn("manual loading error", err);
                    }
                }
            });
            sub.add(manualSub);
        }

        if (!suppressPolling) {
            const pollSub = poll$.subscribe({
                // next: val => console.log("poll result", val),
                // complete: () => console.log("polling complete"),
                error: err => {
                    if (err.rxdb) {
                        rxdbErrorHandler(err)
                    } else {
                        console.warn("polling error", err);
                    }
                }
            });
            sub.add(pollSub);
        }

        return sub;
    })
}


// Make rxdb error more useful

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
