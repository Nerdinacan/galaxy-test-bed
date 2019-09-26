import { of, pipe, BehaviorSubject, defer, concat, combineLatest } from "rxjs";
import { tap, filter, take, mergeMap, share, distinctUntilChanged, retryWhen, switchMapTo, delay } from "rxjs/operators";
import { create, isRxDatabase, isRxCollection } from "rxdb";
import { historySchema, historyContentSchema, datasetSchema,
    datasetCollectionSchema } from "./schema";
import moment from "moment";
import dbConfig from "components/History/model/caching/config";



/**
 * RxDB database object observable
 */

// exporting for testing purposes, should generally
// be considered a private variable
export const dbInstance = new BehaviorSubject(null);

// operator that creates an rxdb instance and stashes the
// result in storage$ (which should be a subject)
export const db$ = combineLatest(of(dbConfig), dbInstance).pipe(
    mergeMap(inputs => {

        const [ config, instance ] = inputs;

        // take instance value if it's ok
        const validInstance$ = of(instance).pipe(
            take(1),
            filter(isRxDatabase),
            filter(db => db.name == config.name)
        )

        // create a new database
        const new$ = defer(async () => {
            const db = await create(config);
            dbInstance.next(db);
            return db;
        });

        // either the existing instance or create a new one
        return concat(validInstance$, new$).pipe(
            take(1)
        );
    }),
    distinctUntilChanged()
)


// removes all data from database, mostly used during testing
export async function wipeDatabase() {
    if (isRxDatabase(dbInstance.value)) {
        await dbInstance.value.remove();
    }
    dbInstance.next(null);
}




/**
 * Creates an observable RxDB collection object. Tries 2 times
 * to create, drops collection each time in event of failure
 */

export const initCollection = config => db$ => {

    const { name } = config;

    return db$.pipe(
        distinctUntilChanged(),
        mergeMap(async db => {
            // if it already exists, try to use it
            const existing = db[name];
            if (existing && isRxCollection(existing)) {
                return existing;
            }
            // rebuild
            return await db.collection(config);
        }),
        retryWhen(err => err.pipe(
            tap(err => console.log(`Collection build error`, name, err)),
            take(1),
            switchMapTo(db$),
            mergeMap(db => {
                console.log(`Removing collection ${name}`);
                return db.removeCollection(name).catch(err => {
                    console.log("Error deleting collection", err);
                    return err;
                });
            }),
            delay(100)
        )),
        share()
    )
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

export const history$ = db$.pipe(
    initCollection({
        name: "history",
        schema: historySchema,
        methods: {
            ...dateMethods
        }
    })
)

export const historyContent$ = db$.pipe(
    initCollection({
        name: "historycontent",
        schema: historyContentSchema,
        methods: {
            ...commonProps,
            ...dateMethods,
            ...collectionCosmetics
        }
    })
)

export const dataset$ = db$.pipe(
    initCollection({
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
)

export const datasetCollection$ = db$.pipe(
    initCollection({
        name: "datasetcollection",
        schema: datasetCollectionSchema,
        methods: {
            ...commonProps,
            ...dateMethods,
            ...collectionCosmetics
        }
    })
)
