/**
 * Generates a function that will update an internal subject. The resulting
 * stream can be observed on the .$ property of the resulting function.
 *
 * Ex:
 *   const setNextDoodad = createInputFunction();
 *   setNextDoodad.$.subscribe(val => console.log(val));
 *   ...
 *   setNextDoodad('hoo');
 *   > "hoo"
 *   setNextDoodat('hah');
 *   > "hah"
 */

import { Subject } from "rxjs";
import { tap } from "rxjs/operators";

export function createInputFunction(debug = false) {
    const sub = new Subject();
    const monitor = sub.pipe(
        tap(val => {
            if (debug) {
                console.log("createInputFunction monitor", val);
            }
        })
    );
    const updateFn = sub.next.bind(sub);
    updateFn.$ = monitor.asObservable();
    return updateFn;
}
