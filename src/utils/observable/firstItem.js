/**
 * Emit the first item from an array result
 */

import { pipe } from "rxjs";
import { map, filter } from "rxjs/operators";

export const firstItem = () => pipe(
    filter(list => Array.isArray(list)),
    filter(list => list.length > 0),
    map(list => list[0])
)
