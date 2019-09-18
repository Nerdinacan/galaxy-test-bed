import {
    addToHistoryCache,
    listenToHistoryCache,
    deleteHistoryFromCache
} from "../History$";

import {
    createHistory,
    updateHistoryFields as updateProps,
    secureHistory,
    cloneHistory,
    deleteHistoryById,
    purgeAllDeletedContent,
    bulkContentUpdate
} from "../queries";

import {
    createPromiseFromOperator,
    cacheContent
} from "../caching";



/**
 * Syncs history list with cached data. An argument can be made
 * that since indexedDb is storing the local data that there is
 * no need for Vuex to do the same thing, but I think there's value
 * in separating the caching mechanism from the store so that the
 * caching mechanism can be replaced on improved modularaly.
 */

export function $init(context, { store }) {
    listenToHistoryCache(store);
}


//#region History CRUD & operations

// TODO: Not convinced this selection should be in global state

export async function createNewHistory() {
    const newHistory = await createHistory();
    addToHistoryCache(newHistory);
    return newHistory;
}

export async function copyHistory(context, { history, name, copyWhat }) {
    const newHistory = await cloneHistory(history, name, copyWhat);
    addToHistoryCache(newHistory);
    return newHistory;
}

export async function deleteHistory({ commit }, { history, purge } = { purge: false }) {
    await deleteHistoryById(history.id, purge);
    deleteHistoryFromCache(history);
    commit("setCurrentHistoryId", null);
    return history;
}

export async function makeHistoryPrivate(context, { history }) {
    const newHistory = await secureHistory(history.id);
    addToHistoryCache(newHistory);
    return newHistory;
}

export async function updateHistoryFields(context, { history, fields }) {
    const updatedHistory = await updateProps(history, fields);
    addToHistoryCache(updatedHistory);
    return updatedHistory;
}

//#endregion


//#region Content selection

// TODO: Not convinced this should be in global state

export function setContentSelection({ commit }, { history, selection = [] }) {
    commit("setContentSelection", {
        historyId: history.id,
        typeIds: selection.map(c => c.type_id)
    });
}

export function clearContentSelection({ dispatch }, { history }) {
    dispatch("setContentSelection", { history });
}

export function selectContentItem({ getters, commit }, { content }) {
    const existingSelection = getters.contentSelection(content.history_id);
    const newSelection = new Set(existingSelection);
    newSelection.add(content.type_id);
    commit("setContentSelection", {
        historyId: content.history_id,
        typeIds: newSelection
    })
}

export function unselectContentItem({ getters, commit }, { content }) {
    const existingSelection = getters.contentSelection(content.history_id);
    const newSelection = new Set(existingSelection);
    newSelection.delete(content.type_id);
    commit("setContentSelection", {
        historyId: content.history_id,
        typeIds: newSelection
    })
}

//#endregion


//#region Content CRUD and operations

export async function deleteContent(_, { content }) {
    console.log("deleteContent");
    // const doomed = await deleteContent(content);
    // const cacheMe = createPromiseFromOperator(cacheContent);
    // return await cacheMe(doomed);
}

export async function undeleteContent(_, { content }) {
    console.log("undeleteContent");
    // const undeleted = await undeleteContent(content);
    // const cacheMe = createPromiseFromOperator(cacheContent);
    // return await cacheMe(undeleted);
}

//#endregion

