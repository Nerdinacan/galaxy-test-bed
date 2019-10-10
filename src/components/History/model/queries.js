/**
 * Basic ajax queries that run against the api.
 */

import axios from "axios";
import { safeAssign } from "utils/safeAssign";


// #region History Queries


const stdHistoryParams = "view=dev-detailed";

const doResponse = response => {
    if (response.status != 200)
        throw new Error(response);
    return response.data;
}


/**
 * Return list of available histories
 */
export async function getHistories(lastUpdate) {
    const baseUrl = `/api/histories?${stdHistoryParams}`;
    const updateClause = lastUpdate ? `q=update_time-gt&qv=${lastUpdate}` : "";
    const url = [ baseUrl, updateClause ].join("&");
    const response = await axios.get(url);
    return doResponse(response);
}


/**
 * Load one history by id
 * @param {String} id
 */
export async function getHistoryById(id) {
    const url = `/api/histories/${id}?${stdHistoryParams}`;
    const response = await axios.get(url);
    return doResponse(response);
}


/**
 * Create new hisotry
 * @param {Object} props Optional history props
 */
export async function createHistory(props = {}) {
    const url = `/api/histories?${stdHistoryParams}`;
    const payload = Object.assign({ name: "New History" }, props);
    const response = await axios.post(url, payload);
    return doResponse(response);
}


/**
 * Generates copy of history on server
 * @param {Object} history Source history
 * @param {String} name New history name
 * @param {Boolean} copyAll Copy existing contents
 */
export async function cloneHistory(history, name, copyAll) {
    const url = `/api/histories?${stdHistoryParams}`;
    const payload = {
        history_id: history.id,
        name,
        all_datasets: copyAll,
        current: true
    };
    const response = await axios.post(url, payload);
    return doResponse(response);
}


/**
 * Delete history on server
 * @param {String} id Encoded history id
 * @param {Boolean} purge Permanent delete
 */
export async function deleteHistoryById(id, purge = false) {
    const url = `/api/histories/${id}` + (purge ? "?purge=True" : "");
    const response = await axios.delete(url);
    return doResponse(response);
}


/**
 * Update specific fields in history
 * @param {Object} history
 * @param {Object} payload Object hash of fields to update
 */
export async function updateHistoryFields(history, payload) {
    const url = `/api/histories/${history.id}?${stdHistoryParams}`;
    const response = await axios.put(url, payload);
    return doResponse(response);
}


/**
 * Set permissions to private for indicated history
 * TODO: rewrite API endpoint for this
 * @param {String} history_id
 */
export async function secureHistory(history_id) {
    const url = "/history/make_private";
    const response = await axios.post(url, formData({ history_id }));
    if (response.status != 200) {
        throw new Error(response);
    }
    return await getHistoryById(history_id);
}

// #endregion

// #region Content Queries

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


/**
 * Generic content query function originally intended to help with bulk updates
 * so we don't have to go through the barbaric legacy /history endpoints and
 * can stay in the /api as much as possible.
 *
 * @param {*} history
 * @param {*} filterParams
 */
export async function getAllContentByFilter(history, filterParams = {}) {
    const { id } = history;
    const strFilter = buildIncompetentQueryFromParams(filterParams);
    const url = `/api/histories/${id}/contents?v=dev&view=summary&keys=accessible&${strFilter}`;
    const response = await axios.get(url);
    return doResponse(response);
}


/**
 * Given a content object, retrieve the detailed dataset or collection
 * object by looking at the url prop of the content
 * @param {*} content
 */
export async function getContentDetails(content) {
    const url = content.url;
    const response = await axios.get(url);
    return doResponse(response);
}


/**
 * Deletes item from history
 *
 * @param {Object} content Content object
 * @param {Boolean} purge Permanent delete
 * @param {Boolean} recursive Scorch the earth?
 */
export async function deleteContent(content, purge = false, recursive = false) {
    const params = [`purge=${purge}`, `recursive=${recursive}`].join("&");
    const { history_id, history_content_type, id } = content;
    const url = `/api/histories/${history_id}/contents/${history_content_type}s/${id}?${params}`;
    const response = await axios.delete(url);
    console.log("deleteContent response", response);
    return doResponse(response);
}

/**
 * Undeletes content flagged as deleted.
 * @param {Object} content
 */
export async function undeleteContent(content) {
    return await updateContentFields(content, {
        deleted: false
    });
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
    return doResponse(response);
}


export async function purgeContent(history, content) {
    const url = `/api/histories/${history.id}/contents/${content.id}?purge=True`;
    const response = await axios.delete(url);
    return doResponse(response);
}

export async function bulkContentUpdate(history, items = [], fields = {}) {
    const { id } = history;
    const url = `/api/histories/${id}/contents`;
    const payload = Object.assign({}, fields, { items });
    const response = await axios.put(url, payload);
    return doResponse(response);
}


// #endregion



// #region Collections

// TODO: Yet another api endpoint that needs fixing
export async function createDatasetCollection(history, inputs = {}) {

    const template = {
        "collection_type": "list",
        "copy_elements": true,
        "name": "list",
        "element_identifiers": [],
        "hide_source_items": "True",
        "type": "dataset_collection"
    }

    const payload = safeAssign(template, inputs);
    const url = `/api/histories/${history.id}/contents?v=dev&view=summary&keys=accessible`;
    const response = await axios.post(url, payload);
    return doResponse(response);
}

// #endregion

// #region Job Queries

// TODO: cache in rxdb for future structural graph?
const jobStash = new Map();
const toolStash = new Map();

export async function loadToolFromJob(jobId) {
    const job = await loadJobById(jobId);
    const tool = await loadToolById(job.toolId);
    return tool;
}

export async function loadJobById(jobId) {
    if (!jobStash.has(jobId)) {
        const url = `/api/jobs/${jobId}?full=false`;
        const response = await axios.get(url);
        const job = response.data;
        jobStash.set(jobId, job);
    }
    return jobStash.get(jobId);
}

export async function loadToolById(toolId) {
    if (!toolStash.has(toolId)) {
        const url = `/api/tools/${toolId}/build`;
        const response = await axios.get(url);
        const tool = response.data;
        toolStash.set(toolId, tool);
    }
    return toolStash.get(toolId);
}

// #endregion


/**
 * Some of the current endpoints mysteriously don't accept JSON, so we need to
 * do some massaging to send in old form post data. (See if axios can just do
 * this for us.)
 * @param {Object} fields
 */
function formData(fields = {}) {
    return Object.keys(fields).reduce((result, fieldName) => {
        result.set(fieldName, fields[fieldName]);
        return result;
    }, new FormData());
}


/**
 * More incompetence.
 * We have a demented query param structure which should probably be murdered
 * instead of passing param=value we pass q=paramName&qv=paramValue because
 * whoever authored this API has never worked on a web application. Anywhere.
 * @param {Object} fields Object with parameters to pass to our dumb api
 */
function buildIncompetentQueryFromParams(fields = {}) {
    return Object.keys(fields).map(key => {
        const val = ruinBooleans(fields[key]);
        return `q=${key}&qv=${val}`;
    }).join("&");
}


/**
 * Oh yeah! And to add even more stupid, the API doesn't take standard true/false
 * it takes a string representation of a python Boolean meaning true is True and
 * false is False
 */
function ruinBooleans(val) {
    if (val === true) return "True";
    if (val === false) return "False";
    return val;
}
