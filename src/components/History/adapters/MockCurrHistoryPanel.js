// Mocks Galaxy.currHistoryPanel to avoid errors when beta
// history panel is active. Most of these functions are completely
// unnecessary with the new observable model.

import store from "store";

export default function MockCurrHistoryPanel() {

    const mock = {
        loadCurrentHistory() {
            console.log("MockCurrHistoryPanel:loadCurrentHistory", ...arguments)
        },
        collapseAll() {
            console.log("MockCurrHistoryPanel:collapseAll", ...arguments);
        },
        refreshContents() {
            console.log("MockCurrHistoryPanel:refreshAll", ...arguments);
        },
        buildCollection() {
            console.log("MockCurrHistoryPanel:buildCollection", ...arguments);
        },
        listenToGalaxy() {
            console.log("MockCurrHistoryPanel:listenToGalaxy", ...arguments);
        },
        get collection() {
            console.log("MockCurrHistoryPanel:collection access", ...arguments);
            return [];
        },
        get model() {
            const history = store.getters["history/currentHistory"];
            const getHistoryProp = prop => {
                return prop in history ? history[prop] : undefined;
            }

            // accommodate backbone's ancient api
            return new Proxy(history, {
                get(obj, propName) {
                    switch(propName) {
                        case "get":
                            return getHistoryProp;
                        default:
                            return getHistoryProp(propName);
                    }
                }
            })

        }
    };

    return mock;
}
