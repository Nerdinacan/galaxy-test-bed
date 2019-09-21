import { pipe } from "rxjs";
import { filter, pluck, distinctUntilChanged, share } from "rxjs/operators";
import { watchVuexSelector } from "utils/observable";


/**
 * Produces an observable that looks at the VuexStore to figure
 * out the current user.
 */
export const CurrentUser = () => pipe(
    watchVuexSelector({
        selector: state => state.user.currentUser
    }),
    filter(Boolean),
    share()
)

// Just the id
export const CurrentUserId = () => pipe(
    CurrentUser(),
    pluck('id'),
    distinctUntilChanged(),
    share()
)