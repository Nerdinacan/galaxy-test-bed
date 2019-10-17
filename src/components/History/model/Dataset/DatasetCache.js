import { pipe } from "rxjs";
import { isRxDocument } from "rxdb";
import { map, mergeMap } from "rxjs/operators";
import { cacheDataset, getDataset } from "../caching";
import { getContentDetails } from "../queries";
import { validate, validateType } from "utils/observable";
import { Dataset } from "./Dataset";
import { Content } from "../Content";

/**
 * Generates a datset observable from source content.
 * Updates self if dataset data is too stale.
 */
export const DatasetCache = () => pipe(
    validateType(Content, "DatasetCache: content not a content object"),
    mergeMap(async content => {
        let cachedDs = await getDataset(content.id);
        if (!cachedDs || isContentStale(cachedDs, content)) {
            const raw = await getContentDetails(content);
            cachedDs = await cacheDataset(raw);
        }
        return cachedDs;
    }),
    validate(isRxDocument),
    map(doc => new Dataset(doc))
)

// Works for any content with an update_type
export const isContentStale = (doc, content) => {
    if (!isRxDocument(doc))
        throw new Error(`isContentStale: doc should be an rxdb doc, instead it is: ${doc.constructor.name}`);
    if (!(content instanceof Content)) {
        console.warn("bad content", content);
        throw new Error(`isContentStale: content should be a Content object, instead it is: ${content.constructor.name}`);
    }
    const model = new Content(doc);
    return model.updateDate.isBefore(content.updateDate);
}

