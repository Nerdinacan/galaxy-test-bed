/**
 * For infathomable reasons, the package called "RxDB" uses almost
 * exclusively a promise-based api. But at least those are easy
 * to test.
 *
 * This is basically one big promise function that assembles the
 * database and all the current collections. Utility methods are
 * provided for our various model types.
 */

import { defer } from "rxjs";
import { share, take, pluck, mergeMap, retryWhen } from "rxjs/operators";
import { create, removeDatabase } from "rxdb";
import { historySchema, historyContentSchema, datasetSchema, datasetCollectionSchema } from "./schema";
import { pruneToSchema } from "./schemaUtils";
import moment from "moment";
import dbConfig from "components/History/model/caching/config";



// Database instance

let _db = null;

export async function getDb(rebuild = false) {
    if (!_db) {
        _db = await buildDb(rebuild);
    }
    return _db;
}

export async function wipeDatabase() {
    const { name, adapter } = dbConfig;
    const result = await removeDatabase(name, adapter);
    _db = null;
    return result;
}

export async function rebuildDatabase() {
    await wipeDatabase();
    return await getDb(true);
}


// db operators
// Because the api is promise-based, need to defer and share the db instance

const db$ = defer(() => getDb()).pipe(
    retryWhen(err => err.pipe(
        mergeMap(rebuildDatabase)
    )),
    share()
);


// operator to return collection

export const getCollection$ = name => db$.pipe(
    pluck(name),
    retryWhen(err => err.pipe(
        mergeMap(rebuildDatabase)
    )),
    share()
)


// promise function to return collection

export const getCollection = name => getCollection$(name).toPromise();




// DB assembly. One big promise that delivers the database instance

async function buildDb(rebuild = false) {
    const config = rebuild ? { ...dbConfig, ignoreDuplicate: true } : dbConfig;
    const db = await create(config);
    await buildHistory(db);
    await buildContent(db);
    await buildDatasets(db);
    await buildDsc(db);
    return db;
}

async function buildHistory(db) {

    const coll = await db.collection({
        name: "history",
        schema: historySchema,
        methods: {
            ...dateMethods
        }
    });

    const historyPruner = pruneToSchema(historySchema);

    const prepareHistory = raw => {
        raw.isDeleted = raw.deleted;
        historyPruner(raw);
    }

    coll.preInsert(prepareHistory, false);
    coll.preSave(prepareHistory, false);

    return coll;
}

async function buildContent(db) {

    // content collection
    const coll = await db.collection({
        name: "historycontent",
        schema: historyContentSchema,
        methods: {
            ...commonProps,
            ...dateMethods,
            ...collectionCosmetics
        }
    })

    const pruner = pruneToSchema(historyContentSchema);

    const prepareContent = raw => {

        raw.isDeleted = raw.deleted;

        // stupid api does not return purged for collections
        if (raw.purged === undefined) {
            raw.purged = false;
        }

        // Again, stupid api will mark something as purged
        // but not deleted.
        if (raw.purged == true) {
            raw.isDeleted = true;
        }

        // stupid api does not return update_time for collections
        if (!raw.update_time) {
            raw.update_time = moment.utc().format();
        }

        pruner(raw);
    }

    coll.preInsert(prepareContent, false);
    coll.preSave(prepareContent, false);

    return coll;
}

async function buildDatasets(db) {

    const coll = await db.collection({
        name: "dataset",
        schema: datasetSchema,
        methods: {
            ...commonProps,
            ...dateMethods,

            getUrl(urlType) {
                const { id, file_ext } = this;
                const urls = {
                    purge: `datasets/${id}/purge_async`,
                    display: `datasets/${id}/display/?preview=True`,
                    edit: `datasets/edit?dataset_id=${id}`,
                    download: `datasets/${id}/display?to_ext=${file_ext}`,
                    report_error: `dataset/errors?id=${id}`,
                    rerun: `tool_runner/rerun?id=${id}`,
                    show_params: `datasets/${id}/show_params`,
                    visualization: "visualization",
                    meta_download: `dataset/get_metadata_file?hda_id=${id}&metadata_name=`
                };
                return (urlType in urls) ? urls[urlType] : null;
            },
        }
    })

    const pruner = pruneToSchema(datasetSchema);

    const prepareDataset = raw => {
        raw.isDeleted = raw.deleted;
        pruner(raw);
    }

    coll.preInsert(prepareDataset, false);
    coll.preSave(prepareDataset, false);

    return coll;
}

async function buildDsc(db) {

    const coll = await db.collection( {
        name: "datasetcollection",
        schema: datasetCollectionSchema,
        methods: {
            ...commonProps,
            ...dateMethods,
            ...collectionCosmetics
        }
    })

    const pruner = pruneToSchema(datasetCollectionSchema);

    const prepareDsc = raw => {

        // api returns no type_id for collections
        if (!raw.type_id) {
            raw.type_id = `${raw.history_content_type}-${raw.id}`;
        }

        raw.isDeleted = raw.deleted;

        if (raw.purged === undefined) {
            raw.purged = false;
        }

        // dataset collections have no update time, so we keep track of it ourself
        // TODO: add update_time to hdca table
        if (!raw.update_time) {
            raw.update_time = (new Date()).toISOString();
        }

        pruner(raw);
    }

    coll.preInsert(prepareDsc, false);
    coll.preSave(prepareDsc, false);

    return coll;
}


// Model mixins

export const dateMethods = {
    getUpdateDate() {
        return moment.utc(this.update_time);
    }
}

const commonProps = {

    isDeletedOrPurged() {
        return this.isDeleted || this.purged;
    },

    hasData() {
        return this.file_size > 0;
    },

    hasMetaData() {
        return this.meta_files.length > 0;
    },

    title() {
        const { name, isDeleted, visible, purged } = this;

        let result = name;

        const itemStates = [];

        if (isDeleted) {
            itemStates.push("Deleted");
        }
        if (visible == false) {
            itemStates.push("Hidden");
        }
        if (purged) {
            itemStates.push("Purged");
        }
        if (itemStates.length) {
            result += ` (${itemStates.join(", ")})`;
        }

        return result;
    }
}

export const collectionCosmetics = {

    collectionType() {
        if (!this.collection_type) {
            return null;
        }
        switch(this.collection_type) {
            case "list":
                return "list"
            case "paired":
                return "dataset pair"
            case "list:paired":
                return "list of pairs";
            default:
                return "nested list";
        }
    },

    collectionCount() {
        const count = this.element_count;
        if (!count) return null;
        return count == 1 ? "with 1 item" : `with ${count} items`;
    }
}
