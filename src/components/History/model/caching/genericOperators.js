import { of, combineLatest, pipe, from } from "rxjs";
import { map, filter, mergeMap, retryWhen, catchError, take } from "rxjs/operators";


/**
 * There's something fishy about RxDB's collection objects, and they fail when
 * used with a standard combineLatest/withLatestFrom, but seem to work when
 * explicitly invoked using this method. Use this when you would normally use
 * withLatestFrom on a database collection.
 *
 * @param {*} rxDbCollection$
 */
export const withLatestFromDb = rxDbCollection$ =>
    mergeMap(src => combineLatest(of(src), rxDbCollection$))


/**
 * Generates a function that returns a promise from an observable operator
 * for interacting with non-observable code.
 * @param {*} operator caching operator
 * @param {...any} configs Config arguments for the operator
 */
export const createPromiseFromOperator = (operator, ...configs) => item => {
    return of(item).pipe(
        operator(...configs)
    ).toPromise();
}


/**
 * Retrieves item from indexDB collection given an
 * observable primary key as a source observable
 * @param {Observable<RxCollection>} collection$
 */
export const getItem = (config = {}) => {

    const {
        live = true,
        collection$
    } = config;

    if (!collection$) {
        throw new Error("Missing collection$ in getItem config");
    }

    return pipe(
        filter(Boolean),
        withLatestFromDb(collection$),
        map(([ key, coll ]) => coll.findOne(key)),
        mergeMap(query => live ? query.$ : query.$.pipe(take(1)))
    )
}


/**
 * Cache object in rxdb collection
 * @param {Observable<RxCollection>} collection$
 */
export const setItem = (config = {}) => {

    const {
        collection$,
        retries = 1
    } = config;

    if (!collection$) {
        throw new Error("Missing collection$ in setItem config");
    }

    return pipe(
        withLatestFromDb(collection$),
        mergeMap(([ item, coll ]) => {
            return from(coll.upsert(item)).pipe(
                retryWhen(err => err.pipe(
                    filter(err => err.name == "conflict"),
                    // tag('setItem 409 error'),
                    take(retries)
                )),
                catchError(err => {
                    console.warn("setItem upsert error", err);
                    return of(null);
                })
            )
        }),
        filter(Boolean)
    )
}


/**
 * Delete object from collection
 * @param {Observable<RxCollection>} collection$
 */
export const deleteItem = collection$ => pipe(
    withLatestFromDb(collection$),
    mergeMap(async ([ item, coll ]) => {
        const keyField = coll.schema.primaryPath;
        const pKey = item[keyField];
        const query = coll.find().where(keyField).eq(pKey);
        return await query.remove();
    })
)


/**
 * Update a few fields in a document, source is an rxDb document
 */
export const updateDocFields = () => {

    return pipe(
        mergeMap(([ doc, changedFields ]) => {
            const p = doc.update({ $set: changedFields })
                .then(() => {
                    // am not sure why this doesn't return anything
                    // useful from the promise, but we'll return the
                    // RxDB document.
                    return doc;
                });
            return from(p);
        }),
        retryWhen(err => err.pipe(
            filter(err => err.name == "conflict"),
            take(1)
        ))
    )
}
