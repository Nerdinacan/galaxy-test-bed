import sinon from "sinon";
import { expect } from "chai";
import { of } from "rxjs";
import { tap, mapTo, pluck, take } from "rxjs/operators";
import { isRxDocument } from "rxdb";

import { wipeDatabase } from "./db";
import {
    cacheHistory, getHistory, uncacheHistory,
    cacheContent, getContent, uncacheContent,
    cacheDataset, getDataset, uncacheDataset,
    cacheDatasetCollection, getDatasetCollection, uncacheDatasetCollection
} from "./operators";

import testHistory from "./testdata/history.json";
import testContent from "./testdata/content.json";
import testDataset from "./testdata/dataset.json";
import testDatasetCollection from "./testdata/datasetCollection.json";


describe("cache/operators.js: rxjs operators", () => {

    afterEach(async () => await wipeDatabase());

    describe("history", () => {

        const testData = testHistory;

        describe("cacheHistory", () => {

            it("should take a raw observable value and cache it", done => {

                const handler = sinon.fake();

                of(testData).pipe(
                    cacheHistory(),
                    take(1)
                ).subscribe({
                    next: handler,
                    complete:() => {
                        expect(handler.called).to.be.true;
                        expect(handler.getCalls().length).to.equal(1);
                        const doc = handler.firstCall.args[0];
                        expect(isRxDocument(doc)).to.be.true;
                        expect(doc.id).to.equal(testData.id);
                        done();
                    }
                })

            })

        })

        describe("getHistory", () => {

            it("should cache a value and return it", done => {

                const wasCached = sinon.fake();
                const wasRetrieved = sinon.fake();

                of (testData).pipe(
                    cacheHistory(),
                    tap(wasCached),
                    pluck('id'),
                    getHistory()
                ).subscribe({
                    next: wasRetrieved,
                    complete: () => {

                        // check what was saved
                        expect(wasCached.called).to.be.true;
                        expect(wasCached.getCalls().length).to.equal(1);
                        const savedDoc = wasCached.firstCall.args[0];
                        expect(isRxDocument(savedDoc)).to.be.true;
                        expect(savedDoc.id).to.equal(testData.id);

                        // check what we pulled back
                        expect(wasRetrieved.called).to.be.true;
                        expect(wasRetrieved.getCalls().length).to.equal(1);
                        const retrievedDoc = wasRetrieved.firstCall.args[0];
                        expect(isRxDocument(retrievedDoc)).to.be.true;
                        expect(retrievedDoc.id).to.equal(testData.id);

                        done();
                    }
                })

            })

        })

        describe("uncacheHistory", () => {

            it("should get a null when retrieving a deleted doc", done => {

                // see what the cache result was
                const wasCached = sinon.fake();

                // see the delete result
                const wasDeleted = sinon.fake();

                // see the attempt to retrieve again
                const wasRetrieved = sinon.fake();

                of (testData).pipe(
                    cacheHistory(),
                    tap(wasCached),
                    pluck('id'),
                    uncacheHistory(),
                    tap(wasDeleted),
                    mapTo(testData.id),
                    getHistory()
                ).subscribe({
                    next: wasRetrieved,
                    complete: () => {

                        // check what was saved
                        expect(wasCached.called).to.be.true;
                        expect(wasCached.getCalls().length).to.equal(1);
                        const savedDoc = wasCached.firstCall.args[0];
                        expect(isRxDocument(savedDoc)).to.be.true;
                        expect(savedDoc.id).to.equal(testData.id);

                        // check what we pulled back
                        expect(wasDeleted.called).to.be.true;
                        expect(wasDeleted.getCalls().length).to.equal(1);
                        const deletedDoc = wasDeleted.firstCall.args[0];
                        expect(isRxDocument(deletedDoc)).to.be.true;
                        expect(deletedDoc.deleted).to.be.true;

                        // check what we pulled back
                        expect(wasRetrieved.called).to.be.true;
                        expect(wasRetrieved.getCalls().length).to.equal(1);
                        const retrievedDoc = wasRetrieved.firstCall.args[0];
                        expect(retrievedDoc).to.be.null;

                        done();
                    }
                })

            })

        })

    })

    xdescribe("content", () => {

        const testData = testContent;

        describe("cacheContent", () => {

            it("should take a raw observable value and cache it", done => {

                const handler = sinon.fake();

                of(testData).pipe(
                    cacheContent()
                ).subscribe({
                    next: handler,
                    complete:() => {
                        expect(handler.called).to.be.true;
                        expect(handler.getCalls().length).to.equal(1);
                        const doc = handler.firstCall.args[0];
                        expect(isRxDocument(doc)).to.be.true;
                        expect(doc.type_id).to.equal(testData.type_id);
                        done();
                    }
                })
            })

        })

        describe("getContent", () => {

            it("should cache a value and return it", done => {

                const wasCached = sinon.fake();
                const wasRetrieved = sinon.fake();

                of (testData).pipe(
                    cacheContent(),
                    tap(wasCached),
                    pluck('type_id'),
                    getContent()
                ).subscribe({
                    next: wasRetrieved,
                    complete: () => {

                        // check what was saved
                        expect(wasCached.called).to.be.true;
                        expect(wasCached.getCalls().length).to.equal(1);
                        const savedDoc = wasCached.firstCall.args[0];
                        expect(isRxDocument(savedDoc)).to.be.true;
                        expect(savedDoc.type_id).to.equal(testData.type_id);

                        // check what we pulled back
                        expect(wasRetrieved.called).to.be.true;
                        expect(wasRetrieved.getCalls().length).to.equal(1);
                        const retrievedDoc = wasRetrieved.firstCall.args[0];
                        expect(isRxDocument(retrievedDoc)).to.be.true;
                        expect(retrievedDoc.type_id).to.equal(testData.type_id);

                        done();
                    }
                })
            })

        })

        describe("uncacheContent", () => {

            it("should get a null when retrieving a deleted doc", done => {

                // see what the cache result was
                const wasCached = sinon.fake();

                // see the delete result
                const wasDeleted = sinon.fake();

                // see the attempt to retrieve again
                const wasRetrieved = sinon.fake();

                of (testData).pipe(
                    cacheContent(),
                    tap(wasCached),
                    pluck('type_id'),
                    uncacheContent(),
                    tap(wasDeleted),
                    mapTo(testData.id),
                    getContent()
                ).subscribe({
                    next: wasRetrieved,
                    complete: () => {

                        // check what was saved
                        expect(wasCached.called).to.be.true;
                        expect(wasCached.getCalls().length).to.equal(1);
                        const savedDoc = wasCached.firstCall.args[0];
                        expect(isRxDocument(savedDoc)).to.be.true;
                        expect(savedDoc.id).to.equal(testData.id);

                        // check what we pulled back
                        expect(wasDeleted.called).to.be.true;
                        expect(wasDeleted.getCalls().length).to.equal(1);
                        const deletedDoc = wasDeleted.firstCall.args[0];
                        expect(isRxDocument(deletedDoc)).to.be.true;
                        expect(deletedDoc.deleted).to.be.true;

                        // check what we pulled back
                        expect(wasRetrieved.called).to.be.true;
                        expect(wasRetrieved.getCalls().length).to.equal(1);
                        const retrievedDoc = wasRetrieved.firstCall.args[0];
                        expect(retrievedDoc).to.be.null;

                        done();
                    }
                })
            })

        })
    })

    xdescribe("dataset", () => {

        const testData = testDataset;

        describe("cacheDataset", () => {

            it("should take a raw observable value and cache it", done => {

                const handler = sinon.fake();

                of(testData).pipe(
                    cacheDataset()
                ).subscribe({
                    next: handler,
                    complete:() => {
                        expect(handler.called).to.be.true;
                        expect(handler.getCalls().length).to.equal(1);
                        const doc = handler.firstCall.args[0];
                        expect(isRxDocument(doc)).to.be.true;
                        expect(doc.id).to.equal(testData.id);
                        done();
                    }
                })

            })
        })

        describe("getDataset", () => {

            it("should cache a value and return it", done => {

                const wasCached = sinon.fake();
                const wasRetrieved = sinon.fake();

                of (testData).pipe(
                    cacheDataset(),
                    tap(wasCached),
                    pluck('id'),
                    getDataset()
                ).subscribe({
                    next: wasRetrieved,
                    complete: () => {

                        // check what was saved
                        expect(wasCached.called).to.be.true;
                        expect(wasCached.getCalls().length).to.equal(1);
                        const savedDoc = wasCached.firstCall.args[0];
                        expect(isRxDocument(savedDoc)).to.be.true;
                        expect(savedDoc.id).to.equal(testData.id);

                        // check what we pulled back
                        expect(wasRetrieved.called).to.be.true;
                        expect(wasRetrieved.getCalls().length).to.equal(1);
                        const retrievedDoc = wasRetrieved.firstCall.args[0];
                        expect(isRxDocument(retrievedDoc)).to.be.true;
                        expect(retrievedDoc.id).to.equal(testData.id);

                        done();
                    }
                })

            })

        })

        describe("uncacheDataset", () => {

            it("should get a null when retrieving a deleted doc", done => {

                // see what the cache result was
                const wasCached = sinon.fake();

                // see the delete result
                const wasDeleted = sinon.fake();

                // see the attempt to retrieve again
                const wasRetrieved = sinon.fake();

                of (testData).pipe(
                    cacheDataset(),
                    tap(wasCached),
                    pluck('id'),
                    uncacheDataset(),
                    tap(wasDeleted),
                    mapTo(testData.id),
                    getDataset()
                ).subscribe({
                    next: wasRetrieved,
                    complete: () => {

                        // check what was saved
                        expect(wasCached.called).to.be.true;
                        expect(wasCached.getCalls().length).to.equal(1);
                        const savedDoc = wasCached.firstCall.args[0];
                        expect(isRxDocument(savedDoc)).to.be.true;
                        expect(savedDoc.id).to.equal(testData.id);

                        // check what we pulled back
                        expect(wasDeleted.called).to.be.true;
                        expect(wasDeleted.getCalls().length).to.equal(1);
                        const deletedDoc = wasDeleted.firstCall.args[0];
                        expect(isRxDocument(deletedDoc)).to.be.true;
                        expect(deletedDoc.deleted).to.be.true;

                        // check what we pulled back
                        expect(wasRetrieved.called).to.be.true;
                        expect(wasRetrieved.getCalls().length).to.equal(1);
                        const retrievedDoc = wasRetrieved.firstCall.args[0];
                        expect(retrievedDoc).to.be.null;

                        done();
                    }
                })

            })

        })

    })

    xdescribe("datasetCollection", () => {

        const testData = testDatasetCollection;

        describe("cacheDatasetCollection", () => {

            it("should take a raw observable value and cache it", done => {

                const handler = sinon.fake();

                of(testData).pipe(
                    cacheDatasetCollection()
                ).subscribe({
                    next: handler,
                    complete:() => {
                        expect(handler.called).to.be.true;
                        expect(handler.getCalls().length).to.equal(1);
                        const doc = handler.firstCall.args[0];
                        expect(isRxDocument(doc)).to.be.true;
                        expect(doc.id).to.equal(testData.id);
                        done();
                    }
                })

            })

        })

        describe("getDataset", () => {

            it("should cache a value and return it", done => {

                const wasCached = sinon.fake();
                const wasRetrieved = sinon.fake();

                of (testData).pipe(
                    cacheDatasetCollection(),
                    tap(wasCached),
                    pluck('id'),
                    getDatasetCollection()
                ).subscribe({
                    next: wasRetrieved,
                    complete: () => {

                        // check what was saved
                        expect(wasCached.called).to.be.true;
                        expect(wasCached.getCalls().length).to.equal(1);
                        const savedDoc = wasCached.firstCall.args[0];
                        expect(isRxDocument(savedDoc)).to.be.true;
                        expect(savedDoc.id).to.equal(testData.id);

                        // check what we pulled back
                        expect(wasRetrieved.called).to.be.true;
                        expect(wasRetrieved.getCalls().length).to.equal(1);
                        const retrievedDoc = wasRetrieved.firstCall.args[0];
                        expect(isRxDocument(retrievedDoc)).to.be.true;
                        expect(retrievedDoc.id).to.equal(testData.id);

                        done();
                    }
                })

            })

        })

        describe("uncacheDatasetCollection", () => {

            it("should get a null when retrieving a deleted doc", done => {

                // see what the cache result was
                const wasCached = sinon.fake();

                // see the delete result
                const wasDeleted = sinon.fake();

                // see the attempt to retrieve again
                const wasRetrieved = sinon.fake();

                of (testData).pipe(
                    cacheDatasetCollection(),
                    tap(wasCached),
                    pluck('id'),
                    uncacheDatasetCollection(),
                    tap(wasDeleted),
                    mapTo(testData.id),
                    getDatasetCollection()
                ).subscribe({
                    next: wasRetrieved,
                    complete: () => {

                        // check what was saved
                        expect(wasCached.called).to.be.true;
                        expect(wasCached.getCalls().length).to.equal(1);
                        const savedDoc = wasCached.firstCall.args[0];
                        expect(isRxDocument(savedDoc)).to.be.true;
                        expect(savedDoc.id).to.equal(testData.id);

                        // check what we pulled back
                        expect(wasDeleted.called).to.be.true;
                        expect(wasDeleted.getCalls().length).to.equal(1);
                        const deletedDoc = wasDeleted.firstCall.args[0];
                        expect(isRxDocument(deletedDoc)).to.be.true;
                        expect(deletedDoc.deleted).to.be.true;

                        // check what we pulled back
                        expect(wasRetrieved.called).to.be.true;
                        expect(wasRetrieved.getCalls().length).to.equal(1);
                        const retrievedDoc = wasRetrieved.firstCall.args[0];
                        expect(retrievedDoc).to.be.null;

                        done();
                    }
                })

            })

        })

    })

})
