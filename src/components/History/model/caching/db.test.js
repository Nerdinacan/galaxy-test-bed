import { expect } from "chai";
import { isRxDatabase, isRxCollection, isRxDocument } from "rxdb";

import { getDb, wipeDatabase, getCollection } from "./db";
import { cacheHistory, getHistory } from "./index";
import testHistory from "./testdata/history.json";


describe("cache/db.js: RxDB instance assembly & disassembly", () => {

    afterEach(async () => await wipeDatabase());

    describe("getDb", () => {

        it("can be built with a promise", async () => {
            const db = await getDb();
            expect(isRxDatabase(db)).to.be.true;
        })

        it("can be rebuilt after a db wipe", async () => {
            const db = await getDb();
            expect(isRxDatabase(db)).to.be.true;
            await wipeDatabase();
            const db2 = await getDb();
            expect(isRxDatabase(db2)).to.be.true;
        })
    })

    describe("getCollection", () => {

        it("can retrieve an rxdb collection", async () => {
            const coll = await getCollection("history");
            expect(isRxCollection(coll)).to.be.true;
        })

        it("can retrieve an rxdb collection after rebuild", async () => {
            const coll = await getCollection("history");
            expect(isRxCollection(coll)).to.be.true;
            await wipeDatabase();
            const coll2 = await getCollection("history");
            expect(isRxCollection(coll2)).to.be.true;
        })
    })

    describe("wipeDatabase", () => {

        it("should not see an inserted doc after a wipe", async () => {
            const doc = await cacheHistory(testHistory);
            expect(isRxDocument(doc)).to.be.true;
            const doc2 = await getHistory(testHistory.id);
            expect(isRxDocument(doc2)).to.be.true;
            await wipeDatabase();
            const doc3 = await getHistory(testHistory.id);
            expect(doc3).to.be.null;
        })
    })

})