import { from, pipe } from "rxjs";
import { switchMap, map, withLatestFrom } from "rxjs/operators";
import { getCollection } from "../caching/db";




/**
 * Rxjs operator that returns an rxdb query against the local database showing
 * everything matching the source parameters. (i.e. run an observable parameter
 * string through this operator)
 *
 * intended source: Observable<SearchParams>
 *
 * @param {*} label
 * @param {*} debug
 */
export const contentObservable = config => {

    const {
        label = "contentObservable",
        debug = false
    } = config;

    const coll$ = from(getCollection('historycontent'));

    return pipe(
        withLatestFrom(coll$),
        // withLatestFromDb(historyContent$),
        map(buildLocalContentQuery({ label, debug })),
        switchMap(query => query.$)
    )
}


/**
 * Generates a live rxdb query to the content that is stored locally in indexDB,
 * filteres according to passed parameters
 * @param {*} config
 */
export const buildLocalContentQuery = config => ([ params, coll ]) => {

    const {
        label = "buildLocalContentQuery",
        debug = false
    } = config;

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

    if (debug) {
        console.groupCollapsed(label);
        params.report(label);
        console.log("query", query.mquery);
        console.log(query.stringRep);
        console.groupEnd();
    }

    return query;
}
