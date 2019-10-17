import { pipe } from "rxjs";
import { isRxDocument } from "rxdb";
import { map, mergeMap } from "rxjs/operators";
import { cacheDatasetCollection, getDatasetCollection } from "../caching";
import { getContentDetails } from "../queries";
import { validate } from "utils/observable";
import { DatasetCollection } from "./DatasetCollection";
import { isContentStale } from "../Dataset";
import { Content } from "../Content";


export const DatasetCollectionCache = () => pipe(
    validate(isRxDocument, "DatasetCollectionCache: content not an rxdoc"),
    mergeMap(async contentDoc => {
        const content = new Content(contentDoc);
        let dsc = await getDatasetCollection(content.id);
        if (!dsc || isContentStale(dsc, content)) {
            const raw = await getContentDetails(content);
            dsc = await cacheDatasetCollection(raw);
        }
        return dsc;
    }),
    // wrap collection with this horrible wrapper because our amateur API does
    // not return consistent results between a single dataset and
    // a tree of datasets.
    validate(isRxDocument),
    map(dsc => new DatasetCollection(dsc.toJSON()))
)

