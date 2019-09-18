import { of, defer, isObservable } from "rxjs";
import { tap, switchMap, repeatWhen, delay, finalize } from "rxjs/operators";

/**
 * Operator to create a periodic poll. Individual requests are built with the
 * buildPollRequest parameter which should return an observable. Optional retrigger events force a poll immediately
 * delaytime is the amount of time to wait after the previous poll has completed
 */
export const poll = (config = {}) => src => {

    const { 
        buildPollRequest, 
        delayDuration = 5000,
        debug = false,
        // triggers = [],
    } = config

    // const arrTriggers = Array.isArray(triggers) ? triggers : [ triggers ];
    
    if (!(buildPollRequest instanceof Function)) {
        throw new Error("Please provide an observable factory to poll. Should be a function that takes the inputs and returns an observable.")
    }

    return src.pipe(
        switchMap(inputs => {

            // build request from source inputs
            const request$ = defer(() => {

                if (debug) {
                    console.log("initializing request");
                }

                return of(inputs).pipe(
                    tap(args => {
                        if (debug) {
                            console.group("poll", args, new Date().toISOString());
                        }
                    }),
                    switchMap(args => {
                        const obs$ = buildPollRequest(args);
                        if (!isObservable(obs$)) {
                            throw new Error("Observable factory did not return an observable");
                        }
                        return obs$;
                    }),
                    finalize(() => {
                        if (debug) {
                            console.log("poll done");
                            console.groupEnd();
                        }
                    })
                )
            });

            // repeat that request on the timer or when immediate triggers fire
            return request$.pipe(
                repeatWhen(done => done.pipe(
                    delay(delayDuration)
                ))
            )
        })
    )

}


// return merge(done, ...arrTriggers).pipe(
//     tap(interrupter => {
//         if (debug) {
//             console.log("something triggered!", interrupter);
//         }
//     }),
//     delay(delayDuration)
// );