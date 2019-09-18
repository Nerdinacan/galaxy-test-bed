import VuexPersistence from "vuex-persist";
import * as mutations from "./mutations";
import * as getters from "./getters";
import * as actions from "./actions";

export const defaultState = {
    currentHistoryId: null,
    histories: [],
    contentSelection: {},
    selectedCollection: {}
}

export const historyStore = {
    namespaced: true,
    state: Object.assign({}, defaultState),
    mutations,
    getters,
    actions
}


/**
 * Caches user settings like "currentHistory" in localStorage instead
 * of having the server do that for them. Hopefully doing this in the client
 * will mean we can move closer towards a completely stateless REST api.
 */

export const historyPersist = new VuexPersistence({
    key: "vuex-state-history",
    modules: ["history"],
    reducer: state => ({
        history: {
            currentHistoryId: state.history.currentHistoryId
        }
    })
})
