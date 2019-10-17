import { of, combineLatest, forkJoin, from } from "rxjs";
import { map, pluck, share, take } from "rxjs/operators";
import { isRxDocument } from "rxdb";
import { getContent, cacheContent } from "../caching";
import { getContent as getContentOperator, updateDocFields } from "../caching/operators";
import {
    updateContentFields,
    bulkContentUpdate,
    getAllContentByFilter,
    deleteContent as ajaxDeleteContent,
    undeleteContent as ajaxUndeleteContent
} from "../queries";
import { safeAssign } from "utils/safeAssign";


function isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}


// #region Individual operations

export async function deleteContent(content, purge = false, recursive = false) {
    const doomed = await ajaxDeleteContent(content, purge, recursive);
    return await cacheContent(doomed);
}

export async function undeleteContent(content) {
    const undeleted = await ajaxUndeleteContent(content);
    return await cacheContent(undeleted);
}

export async function updateContent(content, fields) {

    let updatedContent = await updateContentFields(content, fields);

    // For whatever hairbrained reason, updates to datasetcollections don't return
    // an updated record like dataset updates do, so we'll need to recreate those props
    // so that we can cache the update
    if (isEmptyObject(updatedContent)) {
        const origProps = isRxDocument(content) ? content.toJSON() : content;
        updatedContent = Object.assign({}, origProps, fields);
    }

    return await cacheContent(updatedContent);
}

// #endregion


// #region Operate on a list of items

export const updateSelectedContent = updates => async (history, selection) => {

    // turn selection into items
    const items = selection.map(c => ({
        id: c.id,
        history_content_type: c.history_content_type
    }))

    // ajax call
    const changed = await bulkContentUpdate(history, items, updates);

    // update changed results
    const promises = changed.map(c => c.type_id)
        .map(async typeId => {
            const c = await getContent(typeId);
            if (null === c) return null;
            const props = Object.assign({}, c.toJSON(), updates);
            return await cacheContent(props);
        })
        .filter(Boolean);

    return await Promise.all(promises);
}

export const hideSelectedContent = updateSelectedContent({
    visible: false
})

export const unhideSelectedContent = updateSelectedContent({
    visible: true
})

export const deleteSelectedContent = updateSelectedContent({
    deleted: true
})

export const undeleteSelectedContent = updateSelectedContent({
    deleted: false
})

export const purgeSelectedContent = updateSelectedContent({
    deleted: true,
    purged: true
})

// #endregion


// #region Bulk operations across history

export async function unhideAllHiddenContent(history) {
    const filter = { visible: false };
    const selection = await getAllContentByFilter(history, filter);
    if (selection.length) {
        return await unhideSelectedContent(history, selection);
    }
    return [];
}

export async function deleteAllHiddenContent(history) {
    const filter = { visible: false };
    const selection = await getAllContentByFilter(history, filter);
    if (selection.length) {
        return await deleteSelectedContent(history, selection);
    }
    return [];
}

export async function purgeAllDeletedContent(history) {
    const filter = { deleted: true, purged: false };
    const selection = await getAllContentByFilter(history, filter);
    if (selection.length) {
        return await purgeSelectedContent(history, selection);
    }
    return [];
}

// #endregion


export function updateDataset(data, inputFields) {

    const item$ = of(data);

    const content$ = item$.pipe(
        pluck('type_id'),
        getContentOperator()
    )

    // ajax call to update fields
    const savePromise = updateContentFields(data, inputFields);
    const savedFields$ = from(savePromise).pipe(
        map(updated => {
            const target = Object.assign({}, inputFields);
            return safeAssign(target, updated)
        }),
        take(1),
        share()
    )

    // cache in dataset/datasetCollection rxdb collection
    const cachedData$ = combineLatest(item$, savedFields$).pipe(
        updateDocFields()
    )

    // cache in content summary
    const cachedContent$ = combineLatest(content$, savedFields$).pipe(
        updateDocFields()
    )

    // wait for both updates
    return forkJoin([ cachedData$, cachedContent$ ])
}
