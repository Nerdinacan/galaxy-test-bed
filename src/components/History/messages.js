/**
 * Having the strings in one place makes localization a little easier inside the
 * components.
 *
 * TODO: Should we do this with a json file?
 * Is there a standard convention we should be following?
 */


// content selection
const contentSelection  = {
    unhideContent: "Really unhide all hidden datasets?",
    deleteHiddenContent: "Really delete all hidden datasets?",
    purgeDeletedContent: "Really delete all deleted datasets permanently? This cannot be undone."
}

// DatasetMenu.vue
const datasetMenu = {

    // display button
    displayPurged: "Cannot display datasets removed from disk",
    displayUploading: "This dataset must finish uploading before it can be viewed",
    displayTooNew: "This dataset is not yet viewable",
    displayDefault: "View data",

    // edit attributes button
    editDeleted: "Unedit dataset to edit attributes",
    editPurged: "Cannot edit attributes of datasets removed from disk",
    editNotReady: "This dataset is not yet editable",
    editDefault: "Edit attributes",

    // delete dataset button
    deleteAlreadyDeleted: "Dataset is already deleted",
    deleteDefault: "Delete"
}

// HistoryDetails.vue
const historyDetails = {
    deleteHistoryPrompt: "Really delete the current history?",
    purgeHistoryPrompt: "Really delete the current history permanently? This cannot be undone.",
    makePrivatePrompt: "This will make all the data in this history private (excluding library datasets), and will set permissions such that all new data is created as private.  Any datasets within that are currently shared will need to be re-shared or published. Are you sure you want to do this?"
}

// HistoryMessages
const historyMessages = {
    deletedHistory: "This history has been deleted",
    quotaWarning: "You are over your disk quota. Tool execution is on hold until your disk usage drops below your allocated quota."
}

// Tool Help Modal
const toolHelpModal = {
    nohelp: "Tool help is unavailable for this dataset."
}


const messages = Object.assign({},
    contentSelection,
    datasetMenu,
    historyDetails,
    historyMessages,
    toolHelpModal
);


export default {
    data() {
        return {
            messages
        }
    }
}
