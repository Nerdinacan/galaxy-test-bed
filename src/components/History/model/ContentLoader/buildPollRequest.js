/**
 * Rxjs operator: buildPollRequest
 *
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
import { of, pipe } from "rxjs";
import { tap, map, pluck, take } from "rxjs/operators";
import { ajaxGet, firstItem, split, validateType } from "utils/observable";
import { getHistory, cacheContent, cacheHistory } from "../caching/operators";
import { SearchParams } from "../SearchParams";
import { DateStore } from "./DateStore";


// source: SearchParams
export const buildPollRequest = () => pipe(

    // validate source stream, this observable needs one parameter object
    validateType(SearchParams),
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
            cacheHistory(),
            tap(history => setLastUpdateTime(history, "historypoll"))
        ).subscribe({
            next: newHistory => console.log("buildPollRequest: history refreshed", newHistory.toJSON()),
            error: err => console.warn("buildPollRequest: error", err),
            complete: () => console.log("buildPollRequest: complete"),
        })
    }),

    // retrieve new content for previously cached history
    map(buildContentsUrl),
    ajaxGet(),
    split(),
    cacheContent(),
    tap(content => setLastUpdateTime({ id: content.history_id }, "contentpoll")),
)

export const buildHistoryUrl = history => {
    const base = "/api/histories?view=detailed&keys=size,non_ready_jobs,contents_active,hid_counter&context=historypoll";
    const idCriteria = `q=encoded_id-in&qv=${history.id}`;
    const since = getLastUpdateTime(history, "historypoll") || history.update_time;
    const updateCriteria = `q=update_time-gt&qv=${since}`;
    const parts = [ base, idCriteria, updateCriteria ];
    return parts.filter(o => o.length).join("&");
}

export const buildContentsUrl = history => {
    const base = `/api/histories/${history.id}/contents?v=dev&view=summary&keys=accessible&context=contentpoll`;
    const since = getLastUpdateTime(history, "contentpoll") || history.update_time;
    const updateCriteria = `q=update_time-gt&qv=${since}`;
    const parts = [ base, updateCriteria ];
    return parts.filter(o => o.length).join("&");
}



// Session storage, keeps track of last request date because we don't
// want to store the update_time in the indexDB and the API doesn't
// update history properly when its pieces change. We can remove this
// if the api gets fixed.

const store = DateStore();

function getLastUpdateTime({ id }, context) {
    const key = `${context}-${id}`;
    return store.getItem(key);
}

function setLastUpdateTime({ id }, context) {
    const key = `${context}-${id}`;
    store.setItem(key);
}
