import { of, pipe } from "rxjs";
import { tap, filter, map, pluck, take } from "rxjs/operators";
import { ajaxGet, firstItem, split } from "utils/observable";
import { getHistory, cacheContent, cacheHistory } from "../caching/operators";
import { SearchParams } from "../SearchParams";


/**
 * Generates an observable for a single poll request for a given history id
 * Acceps a parameter stream as the source, and makes 2 ajax calls.]
 *
 * The first updates the history object by running a query against the api
 * filtered by the cached history.update_time.
 *
 * The second ajax request looks for content that has been updated since that
 * same history.update_time
 *
 * intended source: Observable<SearchParams>
 */
export const buildPollRequest = () => pipe(

    // validate source stream, this observable needs one parameter object
    filter(param => param instanceof SearchParams),
    take(1),

    // find the history from the params source
    pluck('historyId'),
    getHistory(),

    // side-effect refreshes history object if it's been updated
    tap(history => {
        of(history).pipe(
            map(buildHistoryUrl),
            ajaxGet(),
            firstItem(),
            cacheHistory()
        ).subscribe({
            next: newHistory => console.log("history refreshed", newHistory.toJSON()),
            error: err => console.warn("error updating history", err),
            // complete: () => console.log("history refresh done")
        })
    }),

    // retrieve new content for previously cached history
    map(buildContentsUrl),
    ajaxGet(),
    split(),
    cacheContent()
)

export const buildHistoryUrl = history => {
    const base = "/api/histories?context=historypoll&view=detailed&keys=size,non_ready_jobs,contents_active,hid_counter";
    const idCriteria = `q=encoded_id-in&qv=${history.id}`;
    const updateCriteria = `q=update_time-gt&qv=${history.update_time}`;
    const parts = [ base, idCriteria, updateCriteria ];
    return parts.filter(o => o.length).join("&");
}

export const buildContentsUrl = history => {
    const base = `/api/histories/${history.id}/contents?v=dev&view=summary&keys=accessible&context=contentpoll`;
    const updateCriteria = `q=update_time-gt&qv=${history.update_time}`;
    const parts = [ base, updateCriteria ];
    return parts.filter(o => o.length).join("&");
}
