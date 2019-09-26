import { of } from "rxjs";
import { HistoryCache } from "../History";
import { CurrentUserId } from "store/userStore";


/**
 * Syncs history list with cached data. Observables do most of the
 * work of caching and updating, we just dump the results back into
 * Vuex when we're done.
 */

export function $init({ commit }, { store }) {

    // generate CurrentUserId observable by looking at the store
    const CurrentUserId$ = of(store).pipe(CurrentUserId());

    // generate a history cache observable from the user id
    const HistoryCache$ = CurrentUserId$.pipe(HistoryCache());

    // transfers changing results of indexDB contents to the vuex store
    // so we can maintain the fiction that Vuex has a reason to be here
    HistoryCache$.subscribe({
        next: list => {
            console.log("histories?", list.length, list);
            commit("setHistories", list);
        },
        error: err => console.warn("Histories$, error", err)
    })
}


// #region Content selection

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

// #endregion