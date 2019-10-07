/* global __rewire_reset_all__ */
import sinon from "sinon";
import assert from "assert";
import { expect } from "chai";
import { isRxDocument } from "rxdb";

import {
    createNewHistory,
    copyHistory,
    deleteHistory,
    __RewireAPI__ as rw
} from "./crud";

import { cacheHistory, uncacheHistory, getHistory } from "../caching";
import { wipeDatabase } from "../caching/db";

import sampleHistories from "../testdata/histories.json";
import oneHistory from "../testdata/history.json";

// we use a lot of listeners in here
process.setMaxListeners(0);


// cleanup
let sub;
afterEach(async () => {
    if (sub) sub.unsubscribe();
    sub = null;
    sinon.restore();
    __rewire_reset_all__();
    return await wipeDatabase();
})


/**
 * User CRUD operations, most perform an ajax operation, then
 * register the results of that operation with addHistoryToCache
 * or deleteHistoryFromCache
 */
describe("History/ CRUD functions", () => {

    let cacheSpy, uncacheSpy;

    beforeEach(() => {
        cacheSpy = sinon.fake(cacheHistory);
        uncacheSpy = sinon.fake(uncacheHistory);
        rw.__Rewire__("cacheHistory", cacheSpy);
        rw.__Rewire__("uncacheHistory", uncacheSpy);
    })

    describe("createNewHistory", () => {

        let fakeCreateHistory;

        beforeEach(() => {
            fakeCreateHistory = sinon.fake(async () => oneHistory);
            rw.__Rewire__("createHistory", fakeCreateHistory);
        })

        it("should be a function", () => {
            expect(createNewHistory).to.be.instanceOf(Function);
        })

        it("should return a new history when called", async () => {
            const newHistory = await createNewHistory();
            assert(fakeCreateHistory.called);
            assert(cacheSpy.called);
            expect(cacheSpy.firstCall.args[0]).to.equal(oneHistory);
            assert(isRxDocument(newHistory));
            expect(newHistory.id).to.equal(oneHistory.id);
        })
    })

    describe("copyHistory", () => {

        let fakeCreateHistory, fakeCloneHistory, id = "abc123";

        beforeEach(() => {
            fakeCreateHistory = sinon.fake(async () => oneHistory);

            fakeCloneHistory = sinon.fake((original, name) => {
                const result = Object.assign({}, original, {
                    name, id
                });
                delete result._rev;
                return result;
            });

            rw.__Rewire__("createHistory", fakeCreateHistory);
            rw.__Rewire__("cloneHistory", fakeCloneHistory);
        })

        it("should be a function", () => {
            expect(copyHistory).to.be.instanceOf(Function);
        })

        it("should return a new cached document based on passed item", async () => {

            const newHistory = await createNewHistory();
            assert(fakeCreateHistory.called);
            assert(cacheSpy.called);
            expect(cacheSpy.firstCall.args[0]).to.equal(oneHistory);
            assert(isRxDocument(newHistory));
            expect(newHistory.id).to.equal(oneHistory.id);

            const newName = "floob";
            const clonedHistory = await copyHistory(newHistory, newName);
            assert(isRxDocument(clonedHistory));
            assert(fakeCloneHistory.called);
            expect(clonedHistory.name).to.equal(newName);
            expect(clonedHistory.size).to.equal(newHistory.size);
        })
    })

    describe("deleteHistory", () => {

        // Fake ajax call

        let fakeDelete;

        beforeEach(() => {
            fakeDelete = sinon.fake(id => {
                return sampleHistories.find(h => h.id == id);
            });
            rw.__Rewire__("deleteHistoryById", fakeDelete);
        })


        // Pre-fill cache with sample histories

        const firstId = sampleHistories[0].id;

        beforeEach(async () => {
            rw.__Rewire__("getHistories", async () => []);
            const promises = sampleHistories.map(cacheHistory);
            return await Promise.all(promises);
        });


        it("should be a function", () => {
            expect(deleteHistory).to.be.instanceOf(Function);
        })

        it("should return the deleted history", async () => {
            const doc = await getHistory(firstId);
            assert(isRxDocument(doc));
            const doomed = await deleteHistory(doc);
            assert(fakeDelete.called);
            assert(isRxDocument(doomed));
        })

        it("the deleted history should not be cached any more", async () => {
            const doc = await getHistory(firstId);
            assert(isRxDocument(doc));
            const doomed = await deleteHistory(doc);
            assert(fakeDelete.called);
            assert(isRxDocument(doomed));

            const lookAgain = await getHistory(firstId);
            expect(lookAgain).to.be.null;
        })

    })

})