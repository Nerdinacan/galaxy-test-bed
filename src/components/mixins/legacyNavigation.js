/**
 * Navigation mixin for legacy code. Supplies functions to components
 * to navigation to locations not controlled by Vue
 */

import { redirectToSiteUrl, backboneRedirect, iframeRedirect } from "utils/redirect";

export default {
    methods: {
        go(path) {
            console.log("go", path);
            // redirectToSiteUrl(path);
        },
        iframeGo(path) {
            console.log("iframeGo", path);
            // iframeRedirect(path);
        },
        backboneGo(path) {
            console.log("backboneGo", path);
            // backboneRedirect(path);
        },
        bbRoute() {

        },
        addDataset(id) {
            console.log("addDataset", id);
        }
    }
}

// useGalaxy(Galaxy => {
//     if (Galaxy.frame && Galaxy.frame.active) {
//         Galaxy.frame.addDataset(this.dataset.id);
//     } else {
//         const path = this.getUrl('display');
//         iframeRedirect(path);
//     }
// })
