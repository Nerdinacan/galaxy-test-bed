import { of, combineLatest, forkJoin, from } from "rxjs";
import { map, pluck, share, take } from "rxjs/operators";
import { getContent, updateDocFields } from "../caching/operators";
import { safeAssign } from "utils/safeAssign";
import { updateContentFields } from "../queries";



// This function actually works for both datasets and collections
// TODO: rewrite with the plain promises, probably will be easier

export function updateDataset(data, inputFields) {

    const item$ = of(data);

    const content$ = item$.pipe(
        pluck('type_id'),
        getContent({ live: false })
    )

    // ajax call to update fields
    const savePromise = updateContentFields(data, inputFields);
    const savedFields$ = from(savePromise).pipe(
        map(updated => {
            const target = Object.assign({}, inputFields);
            return safeAssign(target, updated)
        }),
        take(1),
        share()
    )

    // cache in dataset/datasetCollection rxdb collection
    const cachedData$ = combineLatest(item$, savedFields$).pipe(
        updateDocFields()
    )

    // cache in content summary
    const cachedContent$ = combineLatest(content$, savedFields$).pipe(
        updateDocFields()
    )

    // wait for both updates
    return forkJoin([ cachedData$, cachedContent$ ])
}
