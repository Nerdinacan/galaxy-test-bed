import { of } from "rxjs";
import { filter, pluck, distinctUntilChanged } from "rxjs/operators";
import { HistoryCache } from "../History";
import { watchVuexSelector } from "utils/observable/vuex";


/**
 * Syncs history list with cached data. Observables do most of the
 * work of caching and updating, we just dump the results back into
 * Vuex when we're done.
 */

let historyCacheSub;

export function $init({ commit }, { store }) {

    // cleanup
    if (historyCacheSub) {
        historyCacheSub.unsubscribe();
    }

    // get userId from vuex
    const userId$ = of(store).pipe(
        watchVuexSelector({
            selector: state => state.user.currentUser
        }),
        filter(Boolean),
        pluck('id'),
        distinctUntilChanged()
    )

    // generate history cache observable from user id
    const HistoryCache$ = userId$.pipe(
        HistoryCache()
    )

    // transfers changing results of indexDB contents to the vuex store
    // so we can maintain the fiction that Vuex has a reason to be here
    historyCacheSub = HistoryCache$.subscribe({
        next: list => commit("setHistories", list),
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
