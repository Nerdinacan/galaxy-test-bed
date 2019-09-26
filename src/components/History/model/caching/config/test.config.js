import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";
import memory from "pouchdb-adapter-memory";

RxDB.plugin(idb);
RxDB.plugin(memory);

export default {
    name: "galaxytest",
    adapter: "memory",
    queryChangeDetection: true,
    ignoreDuplicate: true
}
