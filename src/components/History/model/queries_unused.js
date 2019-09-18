
/**
 * Sets indicated history as current on server.
 * TODO: Remove this incompetent feature, server should not care what the client
 * thinks the current history is because that's going to cause problems if a
 * user has multiple histories open in different windows.
 * @param {String} id Encoded history id
 */
export async function selectCurrentHistory(id) {
    const url = `/history/set_as_current?id=${id}`;
    const response = await axios.put(url);
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
}


// #endregion


// #region Content queries






// TODO: write new api endpoint for this operation because it assumes currentHistory
// TODO: history parameter currently unused, will be required for
// a new endpoint that I'm going to write though.
export async function purgeDeletedContent(history) {
    // GET for unfathomable reasons
    // https://usegalaxy.org/history/purge_deleted_datasets

    const url = "/history/purge_deleted_datasets";
    const response = await axios.get(url);
    if (response.status != 200) {
        throw new Error(response);
    }
    return {
        message: parseMessageFromIncompetence(response.data)
    }
}

// TODO: change this endpoint to return json instead of parsing the old html output
// <div class="message mt-2 alert alert-success">4 datasets have been deleted permanently</div>
const scrubHtmlMessage = /message[^>]+>([^><]+)</i;
function parseMessageFromIncompetence(html) {
    const matches = html.match(scrubHtmlMessage);
    return matches[1];
}


/**
 * Deletes item from history
 * @param {Object} c Content object
 * @param {Boolean} purge Permanent delete
 * @param {Boolean} recursive Scorch the earth?
 */
export async function deleteContent(content, purge = false, recursive = false) {
    const params = [`purge=${purge}`, `recursive=${recursive}`].join("&");
    const { history_id, history_content_type, id } = content;
    const url = `/api/histories/${history_id}/contents/${history_content_type}s/${id}?${params}`;
    const response = await axios.delete(prependPath(url));
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
}

export async function undeleteContent(content) {
    const undeleteResult = await updateContentFields(content, {
        deleted: false
    });
    return undeleteResult;
}





/**
 * Clumsy bulk content update mechanism
 * TODO: rewrite the endpoint that eats this clumsy format
 *
 * Ex:
 *     bulkContentUpdate(history, {
 *         items: [id,id,id],
 *         deleted: true,
 *         color: 'failure'
 *     })
 *
 * @param {History} param0 History object
 * @param {Object} payload Object with a list of items and a set of key-value
 * pairs to update
 */
export async function bulkContentUpdate({ id }, payload) {
    if (!payload.items.length) {
        return;
    }
    const url = `/api/histories/${id}/contents`;
    const response = await axios.put(url, payload);
    return response.data;
}


/**
 * Update specific fields on datasets or collections.
 * @param {Object} content content object
 * @param {Object} body Hash of properties to update
 */
export async function updateContentFields(content, body = {}) {
    const { history_id, id, history_content_type: type } = content;
    const url = `/api/histories/${history_id}/contents/${type}s/${id}`;
    const response = await axios.put(url, body);
    if (response.status != 200) {
        throw new Error(response);
    }
    return response.data;
}


/**
 * Loads specific fields for provided content object, handy for loading
 * visualizations or any other field that's too unwieldy to reasonably include
 * in the standard content caching cycle.
 *
 * @param {Object} content content object
 * @param {Array} fields Array of fields to load
 */
export async function loadContentFields(content, fields = []) {
    if (fields.length) {
        const { history_id, id, history_content_type: type } = content;
        const keys = fields.join(",");
        const url = `/api/histories/${history_id}/contents/${type}s/${id}?keys=${keys}`;
        const response = await axios.get(url);
        if (response.status != 200) {
            throw new Error(response);
        }
        return response.data;
    }
    return null;
}


// #endregion

