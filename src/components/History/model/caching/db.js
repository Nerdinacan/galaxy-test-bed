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
import { share, pluck, mergeMap, retryWhen } from "rxjs/operators";
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
        schema: historySchema
    });

    const historyPruner = pruneToSchema(historySchema);

    const prepareHistory = raw => {
        if (undefined !== raw.deleted) {
            raw.isDeleted = raw.deleted;
        }
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
        schema: historyContentSchema
    })

    const pruner = pruneToSchema(historyContentSchema);

    const prepareContent = raw => {

        if (undefined !== raw.deleted) {
            raw.isDeleted = raw.deleted;
        }

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
        schema: datasetSchema
    })

    const pruner = pruneToSchema(datasetSchema);

    const prepareDataset = raw => {
        if (undefined !== raw.deleted) {
            raw.isDeleted = raw.deleted;
        }
        pruner(raw);
    }

    coll.preInsert(prepareDataset, false);
    coll.preSave(prepareDataset, false);

    return coll;
}

async function buildDsc(db) {

    const coll = await db.collection( {
        name: "datasetcollection",
        schema: datasetCollectionSchema
    })

    const pruner = pruneToSchema(datasetCollectionSchema);

    const prepareDsc = raw => {

        // api returns no type_id for collections
        if (!raw.type_id) {
            raw.type_id = `${raw.history_content_type}-${raw.id}`;
        }

        if (undefined !== raw.deleted) {
            raw.isDeleted = raw.deleted;
        }

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

