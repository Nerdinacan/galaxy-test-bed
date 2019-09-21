import RxDB from "rxdb";
import memory from "pouchdb-adapter-memory";

RxDB.plugin(memory);

// console.log("test environment, using memory db adapter");

export default {
    name: "galaxy",
    adapter: "memory",
    queryChangeDetection: true
}
