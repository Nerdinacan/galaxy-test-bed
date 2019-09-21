// TODO:
// check this out, see if we can replace our poll operator with it.
// https://github.com/jiayihu/rx-polling


import { of, pipe } from "rxjs";
import { map, takeUntil } from "rxjs/operators";
import { createInputFunction, ajaxGet, firstItem, operateOnArray } from "utils/observable";
import { getCachedHistory, cacheContent, cacheHistory } from "../caching";
import moment from "moment";


/**
 * Creates a subject and function to stop polling, primarily for debugging purposes.
 */
export const stopPolling = createInputFunction();


/**
 * Generates an observable for a single poll request for a given history id
 * @param {string} id History Id
 */
export const buildPollRequest = historyId => of(historyId).pipe(
    getCachedHistory({ debug: true, live: false }),
    refreshHistory(),
    loadContentForHistory(),
    takeUntil(stopPolling.$)
)


// Get and cache a newer version of the history object if one exists

// Requests a history with same id but newer update time. Triggers on
// server should update the history so this will show up with no results
// unless something's been updated.

const refreshHistory = debug => pipe(
    map(buildHistoryUrl),
    ajaxGet(),
    firstItem(),
    cacheHistory({ debug })
)

const buildHistoryUrl = history => {
    const base = "/api/histories?context=historypoll&view=detailed&keys=size,non_ready_jobs,contents_active,hid_counter";
    const idCriteria = `q=encoded_id-in&qv=${history.id}`;
    const updateCriteria = `q=update_time-gt&qv=${history.update_time}`;
    const parts = [base, idCriteria, updateCriteria];
    const url = parts.filter(o => o.length).join("&");
    return url;
}



// Requests content if history got a hit. We can't limit by history update_time
// because the dataset collection data does not have an update time
// TODO: add an update time to hdac table

const loadContentForHistory = () => pipe(
    map(buildContentUrlForHistory),
    ajaxGet(),
    cacheContentArray(),
)

const buildContentUrlForHistory = history => {
    const base = `/api/histories/${history.id}/contents?v=dev&view=summary&keys=accessible&context=contentpoll`;
    const since = moment.utc(history.update_time);
    const updateClause = `q=update_time-gt&qv=${since.toISOString()}`
    const parts = [ base, updateClause ];
    return parts.filter(o => o.length).join("&");
}


// Forkjoins an array of cache promises, emits an array of cached objects

const cacheContentArray = debug => pipe(
    operateOnArray(cacheContent({ debug })),
)
