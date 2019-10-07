/**
 * Caching. RxDB's api is mostly promises, which makes no sense.
 * See operators.js for a list of these promises turned into operators
 */

import { isRxDocument } from "rxdb";
import { getCollection } from "./db";

async function save(collName, raw = {}) {

    let saveResult;

    if (isRxDocument(raw)) {
        const doc = await newDoc(collName, raw.toJSON());
        const saved = await doc.save();
        if (!saved) {
            throw new Error("doc not saved");
        }
        saveResult = doc;
    } else {
        const collection = await getCollection(collName);
        saveResult = await collection.upsert(raw);
    }

    if (!isRxDocument(saveResult)) {
        throw new Error("cache result was not an rxdoc", saveResult);
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

async function uncacheItem(collName, item) {
    try {
        const collection = await getCollection(collName);
        const keyfield = collection.schema.primaryPath;
        const key = item[keyfield];
        const doc = await getByPk(collName, key);
        if (!isRxDocument(doc)) {
            throw new Error("lookup item not a doc");
        }
        const result = await doc.remove();
        if (!isRxDocument(result)) {
            throw new Error("removed item not a doc");
        }
        return result;
    } catch(err) {
        // console.log("Error uncaching");
        throw err;
    }
}

async function newDoc(collName, props = {}) {
    const collection = await getCollection(collName);
    const newDoc = collection.newDocument(props);
    if (!isRxDocument(newDoc)) {
        throw new Error("newDoc returned nonsense");
    }
    return newDoc;
}


// history
export const newHistory = props => newDoc("history", props);
export const cacheHistory = item => save("history", item);
export const getHistory = id => getByPk("history", id);
export const uncacheHistory = item => uncacheItem("history", item);

// content
export const newContent = props => newDoc("historycontent", props);
export const cacheContent = item => save("historycontent", item);
export const getContent = type_id => getByPk("historycontent", type_id);
export const uncacheContent = item => uncacheItem("historycontent", item);

// datasets
export const newDataset = props => newDoc("dataset", props);
export const cacheDataset = item => save("dataset", item);
export const getDataset = id => getByPk("dataset", id);
export const uncacheDataset = item => uncacheItem("dataset", item);

// dataset collections
export const newDatasetCollection = props => newDoc("datasetcollection", props);
export const cacheDatasetCollection = item => save("datasetcollection", item);
export const getDatasetCollection = id => getByPk("datasetcollection", id);
export const uncacheDatasetCollection = item => uncacheItem("datasetcollection", item);
