/**
 * History CRUD operations
 */

import { isRxDocument } from "rxdb";
import { cacheHistory, uncacheHistory } from "../caching";
import {
    createHistory,
    deleteHistoryById,
    cloneHistory,
    secureHistory,
    updateHistoryFields as updateProps
} from "../queries";


export async function createNewHistory() {
    const doc = await createHistory();
    return await cacheHistory(doc);
}

export async function copyHistory(history, name, copyWhat) {
    const props = isRxDocument(history) ? history.toJSON() : history;
    const doc = await cloneHistory(props, name, copyWhat);
    return await cacheHistory(doc);
}

export async function deleteHistory(history, purge = false) {
    const { id } = history;
    const doc = await deleteHistoryById(id, purge);
    return await uncacheHistory(doc);
}

export async function makeHistoryPrivate(history) {
    const { id } = history;
    const doc = await secureHistory(id);
    return await cacheHistory(doc);
}

export async function updateHistoryFields(history, fields) {
    const doc = await updateProps(history, fields);
    return await cacheHistory(doc);
}
