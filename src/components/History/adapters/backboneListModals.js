/**
 * Temporary adapters launch bootstrap modals from Vue components, for use with
 * the dataset assembly modals. i.e. With selected..... create dataset collection,
 * create paired collection, etc.
 */

import jQuery from "jquery";
// import atrocities from "mvc/collection/list-collection-creator";
// import warcrimes from "mvc/collection/pair-collection-creator";
// import lawyers from "mvc/collection/list-of-pairs-collection-creator";

export async function datasetListModal(selection) {
    console.log("datasetListModal");
    // const fn = _createCollectionModal(atrocities.createListCollection);
    // return await fn(selection);
}

export async function datasetPairModal(selection) {
    console.log("datasetPairModal");
    // const fn = _createCollectionModal(warcrimes.createPairCollection);
    // return await fn(selection);
}

export async function listOfPairsModal(selection) {
    console.log("listOfPairsModal");
    // const fn = _createCollectionModal(lawyers.createListOfPairsCollection);
    // return await fn(selection);
}

export async function collectionFromRulesModal(selection) {
    console.log("collectionFromRulesModal");
    // const fn = _createCollectionModal(atrocities.createCollectionViaRules);
    // return await fn(selection);
}

const _createCollectionModal = modalHandler => async (selection) => {

    // flatten set to array, turn into plain javascript
    const flatSelection = Array.from(selection).map(doc => doc.toJSON());

    const trojanHorse = {
        toJSON: () => flatSelection,

        // result must be a $.Deferred object instead of a promise because
        // that's the kind of deprecated data format that backbone likes to use.
        createHDCA(
            element_identifiers,
            collection_type,
            name,
            hide_source_items,
            copy_elements,
            options = {}
        ) {
            const def = jQuery.Deferred();
            return def.resolve(null, {
                collection_type,
                name,
                copy_elements,
                hide_source_items,
                element_identifiers
            });
        }
    }

    const def = modalHandler(trojanHorse);
    return await Promise.resolve(def);
}
