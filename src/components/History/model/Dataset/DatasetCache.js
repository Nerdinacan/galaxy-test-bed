import { pipe } from "rxjs";
import { isRxDocument } from "rxdb";
import { mergeMap } from "rxjs/operators";
import { cacheDataset, getDataset, cacheDatasetCollection,
    getDatasetCollection } from "../caching";
import { getContentDetails } from "../queries";
import DscWrapper from "./DscWrapper";


/**
 * Generates a datset observable from source content.
 * Updates self if dataset data is too stale.
 */
export const DatasetCache = () => pipe(
    mergeMap(async content => {

        if (!isRxDocument(content)) {
            throw new Error("DatasetCache: content not an rxdoc");
        }

        let ds = await getDataset(content.id);
        if (!ds || isStale(ds, content)) {
            const raw = await getContentDetails(content);
            ds = await cacheDataset(raw);
        }

        if (!isRxDocument(ds)) {
            throw new Error("DatasetCache: content not an rxdoc");
        }

        return ds;
    })
)


export const DatasetCollectionCache = () => pipe(
    mergeMap(async content => {

        if (!isRxDocument(content)) {
            throw new Error("DatasetCollectionCache: content not an rxdoc");
        }

        let dsc = await getDatasetCollection(content.id);
        if (!dsc || isStale(dsc, content)) {
            const raw = await getContentDetails(content);
            dsc = await cacheDatasetCollection(raw);
        }

        if (!isRxDocument(dsc)) {
            throw new Error("DatasetCollectionCache: dsc not an rxdoc");
        }

        // convert with this horrible wrapper because our amateur API does
        // not return consistent results between a single dataset and
        // a tree of datasets.
        const wrapper = new DscWrapper({
            object: dsc.toJSON()
        });

        return wrapper;
    })
)


// Works for datasets & collections
const isStale = (dataset, content) => {
    if (!isRxDocument(dataset))
        throw new Error("isStale: dataset not an rxdoc");
    if (!isRxDocument(content))
        throw new Error("isStale: content not an rxdoc");
    return dataset.getUpdateDate().isBefore(content.getUpdateDate());
}
