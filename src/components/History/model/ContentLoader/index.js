import { pluck, share } from "rxjs/operators";
import { poll } from "utils/observable";
import { cacheContent } from "../caching/operators";

import { contentObservable } from "./contentObservable";
import { loadManualRequests } from "./loadManualRequests";
import { buildPollRequest } from "./buildPollRequest";

export { stopPolling } from "./buildPollRequest";


// import { create } from "rxjs-spy";
// import { tag } from "rxjs-spy/operators";
// const spy = create();
// spy.log();


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

/**
 * Sets up subscription to 3 key observables for the history component.
 * @param {Observable} p$ Incoming parameter stream
 */
export function ContentLoader(incomingParam$, config = {}) {

    // you can stop manual loading or polling during debugging
    const {
        suppressPolling = false,
        suppressManualLoad = false,
        debug = false
    } = config;

    const param$ = incomingParam$.pipe(
        share()
    )

    // observable that renders content in the list, just
    // stares directly at the db for this history
    const content$ = param$.pipe(
        contentObservable({ debug }),
        share()
    )

    // ajax requests instantiated by filtering/pagination changes
    // combineLatest(param$, content$)
    const manual$ = param$.pipe(
        loadManualRequests(),
        cacheContent()
    )

    // periodic updates, updates to this history independent of what the
    // user is looking at, just depends on the history
    const polling$ = param$.pipe(
        pluck('historyId'),
        poll({ buildPollRequest })
    )

    // group subscription
    function subscribe(/* next, error, complete */) {

        // Standard subscribe handlers apply to content observable,
        // but we also subscribe to the manual/polling observables
        // to keep them running while the history panel is open
        const sub = content$.subscribe(...arguments);

        // when params change, loads next page/params
        if (!suppressManualLoad) {
            const manualSub = manual$.subscribe({
                // next: val => console.log("manual result", val),
                complete: () => console.log("manual complete"),
                error: err => console.warn("manual err", err)
            });
            sub.add(manualSub);
        }

        // catches non-ui updates to history. Server side changes, etc.
        if (!suppressPolling) {
            const pollSub = polling$.subscribe({
                complete: () => console.log("polling complete"),
                error: err => console.warn("polling err", err)
            });
            sub.add(pollSub);
        }

        return sub;
    }

    return {
        subscribe
    }
}

