import { pipe } from "rxjs";
import { isRxDocument } from "rxdb";
import { map, mergeMap } from "rxjs/operators";
import { cacheDataset, getDataset, cacheDatasetCollection,
    getDatasetCollection } from "../caching";
import { getContentDetails } from "../queries";
import { DscWrapper } from "./DscWrapper";
import { validate, validateType } from "utils/observable";


/**
 * Generates a datset observable from source content.
 * Updates self if dataset data is too stale.
 */
export const DatasetCache = () => pipe(
    validate(isRxDocument, "DatasetCache: content not an rxdoc"),
    mergeMap(async content => {
        let ds = await getDataset(content.id);
        if (!ds || isStale(ds, content)) {
            const raw = await getContentDetails(content);
            ds = await cacheDataset(raw);
        }
        return ds;
    }),
    validate(isRxDocument),
)


export const DatasetCollectionCache = () => pipe(
    validate(isRxDocument, "DatasetCollectionCache: content not an rxdoc"),
    mergeMap(async content => {
        let dsc = await getDatasetCollection(content.id);
        if (!dsc || isStale(dsc, content)) {
            const raw = await getContentDetails(content);
            dsc = await cacheDatasetCollection(raw);
        }
        return dsc;
    }),
    // wrap collection with this horrible wrapper because our amateur API does
    // not return consistent results between a single dataset and
    // a tree of datasets.
    validate(isRxDocument),
    map(dsc => new DscWrapper({ object: dsc.toJSON() })),
    validateType(DscWrapper)
)


// Works for datasets & collections
const isStale = (dataset, content) => {
    if (!isRxDocument(dataset))
        throw new Error("isStale: dataset not an rxdoc");
    if (!isRxDocument(content))
        throw new Error("isStale: content not an rxdoc");
    return dataset.getUpdateDate().isBefore(content.getUpdateDate());
}
