import RxDB from "rxdb";
import dbConfig from "components/History/model/caching/config";
import { of } from "rxjs";
import { tap, shareReplay, mergeMap, switchMapTo, retryWhen,
    take, delay } from "rxjs/operators";
import { historySchema, historyContentSchema, datasetSchema,
    datasetCollectionSchema, requestTimeSchema } from "./schema";
import moment from "moment";



/**
 * RxDB database object observable, tries 2 times to create then fails.
 */

const dbConfig$ = of(dbConfig);

export const db$ = dbConfig$.pipe(
    mergeMap(config => {
        // console.log(`Building database ${config.name}`);
        return RxDB.create(config).catch(err => {
            console.warn("Error creating db", err);
            return err;
        });
    }),
    retryWhen(err => err.pipe(
        tap(err => console.warn("DB build error", err)),
        take(2),
        switchMapTo(dbConfig$),
        mergeMap(config => {
            const { name, adapter } = config;
            console.log(`Wiping database ${name}`);
            return RxDB.removeDatabase(name, adapter).catch(err => {
                console.warn("Error wiping database db", err);
                return err;
            });
        }),
        delay(200)
    )),
    shareReplay(1)
)


/**
 * Creates an observable RxDB collection object. Tries 2 times
 * to create, drops collection each time in event of failure
 */

export function initCollection(config) {

    const { name } = config;

    return db$.pipe(
        mergeMap(db => db.collection(config).catch(err => {
            console.warn("Error creating collection", err);
            return err;
        })),
        retryWhen(err => err.pipe(
            tap(err => console.warn(`Collection build error`, name, err)),
            take(2),
            switchMapTo(db$),
            mergeMap(db => {
                console.warn(`Removing collection ${name}`);
                return db.removeCollection(name).catch(err => {
                    console.warn("Error deleting collection", err);
                    return err;
                });
            }),
            delay(100)
        )),
        shareReplay(1)
    );
}


// Mixins

export const commonProps = {

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
    },
}

export const dateMethods = {
    getUpdateDate() {
        return moment.utc(this.update_time);
    }
}

export const collectionCosmetics  = {

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
        if (!this.element_count) {
            return null;
        }
        const count = this.element_count;
        return count == 1 ? "with 1 item" : `with ${count} items`;
    }
}


// Specific collections

export const history$ = initCollection({
    name: "history",
    schema: historySchema,
    methods: {
        ...dateMethods
    }
})

export const historyContent$ = initCollection({
    name: "historycontent",
    schema: historyContentSchema,
    methods: {
        ...commonProps,
        ...dateMethods,
        ...collectionCosmetics
    }
})

export const dataset$ = initCollection({
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

export const datasetCollection$ = initCollection({
    name: "datasetcollection",
    schema: datasetCollectionSchema,
    methods: {
        ...commonProps,
        ...dateMethods,
        ...collectionCosmetics
    }
})

export const requestTime$ = initCollection({
    name: "requestTime",
    schema: requestTimeSchema,
    methods: {
        getLastSentDate() {
            return moment.utc(this.lastSent);
        }
    }
})
