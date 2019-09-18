// assuming we can't have a deleted or purged history
// as the current history id
const validHistoryIds = state =>
    state.histories
        .filter(h => !(h.isDeleted || h.purged))
        .map(h => h.id)


export const currentHistoryId = (state) => {

    const validIds = validHistoryIds(state);

    if (state.currentHistoryId && validIds.includes(state.currentHistoryId)) {
        return state.currentHistoryId;
    }
    if (validIds.length) {
        return validIds[0];
    }
    return null;
}

export const contentSelection = state => historyId => {

    const validIds = validHistoryIds(state);
    const id = validIds.find(id => id === historyId);

    if (id) {
        if (id in state.contentSelection) {
            return state.contentSelection[historyId];
        } else {
            return new Set();
        }
    }
    return undefined;
}

export const getSelectedCollection = (state) => historyId => {
    return state.selectedCollection[historyId];
}
