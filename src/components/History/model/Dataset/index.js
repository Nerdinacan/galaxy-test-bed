export {
    DatasetCache,
    DatasetCollectionCache
} from "./DatasetCache";

export {

    // individual operations
    deleteContent,
    undeleteContent,

    // operations on lists
    hideSelectedContent,
    unhideSelectedContent,
    deleteSelectedContent,
    undeleteSelectedContent,
    purgeSelectedContent,

    // operations on entire history
    unhideAllHiddenContent,
    deleteAllHiddenContent,
    purgeAllDeletedContent,

    // ?
    updateDataset

} from "./crud";

export { DscWrapper } from "./DscWrapper";