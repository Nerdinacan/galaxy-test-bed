import { expect } from "chai";
import assert from "assert";
import { isRxDatabase, isRxCollection, isRxDocument } from "rxdb";

import { getDb, wipeDatabase, getCollection } from "./db";
import { cacheHistory, getHistory } from "./index";
import testHistory from "../testdata/history.json";


describe("caching/db.js: RxDB instance assembly & disassembly", () => {

    afterEach(async () => await wipeDatabase());

    describe("getDb", () => {

        it("can be built with a promise", async () => {
            const db = await getDb();
            assert(isRxDatabase(db));
        })

        it("can be rebuilt after a db wipe", async () => {
            const db = await getDb();
            assert(isRxDatabase(db));
            await wipeDatabase();
            const db2 = await getDb();
            assert(isRxDatabase(db2));
        })
    })

    describe("getCollection", () => {

        it("can retrieve an rxdb collection", async () => {
            const coll = await getCollection("history");
            assert(isRxCollection(coll));
        })

        it("can retrieve an rxdb collection after rebuild", async () => {
            const coll = await getCollection("history");
            assert(isRxCollection(coll));
            await wipeDatabase();
            const coll2 = await getCollection("history");
            assert(isRxCollection(coll2));
        })
    })

    describe("wipeDatabase", () => {

        it("should not see an inserted doc after a wipe", async () => {
            const doc = await cacheHistory(testHistory);
            assert(isRxDocument(doc));
            const doc2 = await getHistory(testHistory.id);
            assert(isRxDocument(doc2));
            await wipeDatabase();
            const doc3 = await getHistory(testHistory.id);
            expect(doc3).to.be.null;
        })
    })

})