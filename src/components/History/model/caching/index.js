/**
 * Caching. RxDB's api is mostly promises, which makes no sense.
 */

import { isRxDocument } from "rxdb";
import { getCollection } from "./db";


async function save(collName, raw = {}) {
    let props = isRxDocument(raw) ? raw.toJSON() : raw;
    const collection = await getCollection(collName);
    const saveResult = await collection.upsert(props);
    if (!isRxDocument(saveResult)) {
        throw new Error("save result was not an rxdoc");
    }
    return saveResult;
}

async function getByPk(collName, key) {
    const collection = await getCollection(collName);
    const query = collection.findOne(key);
    const doc = await query.exec();
    // pouchDB marks docs as _deleted=true when removed,
    // and only gets rid of it after syncing, so we have
    // to check to see if it's been flagged for removal
    return (doc && !doc.deleted) ? doc : null;
}

async function wipeByPk(collName, key) {
    const doc = await getByPk(collName, key);
    if (!isRxDocument(doc)) {
        throw new Error(`Document cannot be deleted from ${collName} because ${key} doesn't exist.`, key);
    }
    return await doc.remove();
}

async function newDoc(collName, props = {}) {
    const collection = await getCollection(collName);
    const newDoc = collection.newDocument(props);
    if (!isRxDocument(newDoc)) {
        throw Error("newDocument returned nonsense");
    }
    return newDoc;
}


// history
export const newHistory = props => newDoc("history", props);
export const cacheHistory = raw => save("history", raw);
export const getHistory = id => getByPk("history", id);
export const uncacheHistory = id => wipeByPk("history", id);

// content
export const newContent = props => newDoc("historycontent", props);
export const cacheContent = raw => save("historycontent", raw);
export const getContent = type_id => getByPk("historycontent", type_id);
export const uncacheContent = type_id => wipeByPk("historycontent", type_id);

// datasets
export const newDataset = props => newDoc("dataset", props);
export const cacheDataset = raw => save("dataset", raw);
export const getDataset = id => getByPk("dataset", id);
export const uncacheDataset = id => wipeByPk("dataset", id);

// dataset collections
export const newDatasetCollection = props => newDoc("datasetcollection", props);
export const cacheDatasetCollection = raw => save("datasetcollection", raw);
export const getDatasetCollection = id => getByPk("datasetcollection", id);
export const uncacheDatasetCollection = id => wipeByPk("datasetcollection", id);
