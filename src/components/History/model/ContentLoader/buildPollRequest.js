import { pipe } from "rxjs";
import { map, pluck, take } from "rxjs/operators";
import { ajaxGet, firstItem, split } from "utils/observable";
import { getHistory, cacheContent, cacheHistory } from "../caching/operators";
import moment from "moment";



/**
 * Generates an observable for a single poll request for a given history id
 */
export const buildPollRequest = () => {

    return pipe(

        // This observable needs to complete. Only do one request
        take(1),

        // find the history from the params source
        pluck('historyId'),
        getHistory(),

        // refresh history
        map(buildHistoryUrl),
        ajaxGet(),
        firstItem(),
        cacheHistory(),

        // retrieve new content for that history
        map(buildContentUrlForHistory),
        ajaxGet(),
        split(),
        cacheContent(),
    )
}

export const buildHistoryUrl = history => {
    const base = "/api/histories?context=historypoll&view=detailed&keys=size,non_ready_jobs,contents_active,hid_counter";
    const idCriteria = `q=encoded_id-in&qv=${history.id}`;
    const updateCriteria = `q=update_time-gt&qv=${history.update_time}`;
    const parts = [base, idCriteria, updateCriteria];
    const url = parts.filter(o => o.length).join("&");
    return url;
}

export const buildContentUrlForHistory = history => {
    const base = `/api/histories/${history.id}/contents?v=dev&view=summary&keys=accessible&context=contentpoll`;
    const since = moment.utc(history.update_time);
    const updateClause = `q=update_time-gt&qv=${since.toISOString()}`
    const parts = [ base, updateClause ];
    return parts.filter(o => o.length).join("&");
}
