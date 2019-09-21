import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";

RxDB.plugin(idb);

// console.log("dev environment, using idb db adapter");

export default {
    name: "galaxy",
    adapter: "idb",
    queryChangeDetection: true
}
