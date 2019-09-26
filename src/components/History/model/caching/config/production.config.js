import RxDB from "rxdb";
import idb from "pouchdb-adapter-idb";

RxDB.plugin(idb);

export default {
    name: "galaxyprod",
    adapter: "idb",
    queryChangeDetection: true
}
