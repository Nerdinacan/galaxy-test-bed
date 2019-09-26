import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";
import memory from "pouchdb-adapter-memory";

RxDB.plugin(idb);
RxDB.plugin(memory);

console.log("development indexdb");

export default {
    name: "galaxydev",
    adapter: "idb",
    queryChangeDetection: true
}
