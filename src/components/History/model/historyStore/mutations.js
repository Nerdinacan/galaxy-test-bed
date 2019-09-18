export function setCurrentHistoryId(state, id) {
    state.currentHistoryId = id;
}

export function setHistories(state, list = []) {
    state.histories = list;
}

export function setContentSelection(state, { historyId, typeIds }) {
    state.contentSelection = {
        ...state.contentSelection,
        [historyId]: new Set(typeIds)
    }
}

export function selectCollection(state, { historyId, typeId = null }) {
    state.selectedCollection = {
        ...state.selectedCollection,
        [historyId]: typeId
    }
}
