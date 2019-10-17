import { combineLatest } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import { getCollection$ } from "../caching/db";
import { Content } from "../Content";


/**
 * Rxjs operator that returns an rxdb query against the local database showing
 * everything matching the source parameters. (i.e. run an observable parameter
 * string through this operator)
 *
 * intended source: Observable<SearchParams>
 */
export const contentObservable = () => param$ => {

    const coll$ = getCollection$('historycontent');

    return combineLatest(param$, coll$).pipe(
        map(buildLocalContentQuery),
        switchMap(query => query.$),
        map(docs => docs.map(doc => new Content(doc)))
    )
}


/**
 * Generates a live rxdb query to the content that is stored locally in indexDB,
 * filteres according to passed parameters
 * @param {*} config
 */
export const buildLocalContentQuery = input$ => {

    const [ params, coll ] = input$;

    if (!params.historyId) {
        throw new Error("Missing historyId");
    }

    const selector = {
        history_id: { $eq: params.historyId }
    }

    // limit to non-deleted
    if (!params.showDeleted) {
        selector.isDeleted = { $eq: false };
    }

    // limit to visible
    if (!params.showHidden) {
        selector.visible = { $eq: true };
    }

    if (params.filterText.length) {
        const filterRE = new RegExp(params.filterText, "gi");
        selector.name = { $regex: filterRE };
    }

    const query = coll.find(selector)
        .sort("-hid")
        .skip(params.skip)
        .limit(params.limit);

    return query;
}
