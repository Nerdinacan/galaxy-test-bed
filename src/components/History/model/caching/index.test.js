import assert from "assert";
import { expect } from "chai";
import { isRxDocument } from "rxdb";

// all promises
import { wipeDatabase } from "./db";
import {
    newHistory, cacheHistory, getHistory, uncacheHistory,
    newContent, cacheContent, getContent, uncacheContent,
    newDataset, cacheDataset, getDataset, uncacheDataset,
    newDatasetCollection, cacheDatasetCollection, getDatasetCollection, uncacheDatasetCollection
} from "./index";

// test json inputs
import testHistory from "../testdata/history.json";
import testContent from "../testdata/content.json";
import testDataset from "../testdata/dataset.json";
import testDatasetCollection from "../testdata/datasetCollection.json";



describe("caching: caching promise functions", () => {

    afterEach(async () => await wipeDatabase());

    describe("history operations", () => {

        const sample = testHistory;

        it("should make a blank history", async () => {
            const doc = await newHistory();
            assert(isRxDocument(doc));
        })

        it("cacheHistory: insert", async () => {
            const doc = await cacheHistory(sample);
            assert(isRxDocument(doc));
            expect(doc.id).to.equal(sample.id);
        })

        it("cacheHistory: update", async () => {

            // save it
            const doc = await cacheHistory(sample);
            assert(isRxDocument(doc));
            expect(doc.id).to.equal(sample.id);

            // make a new doc out fo that old doc
            // because that's how lame the rxdb api is
            const newDoc = await newHistory(doc.toJSON());
            newDoc.name = "nonsense";

            // check to see if it gets saved
            const doc2 = await cacheHistory(newDoc);
            assert(isRxDocument(doc2));
            expect(doc2.id).to.equal(sample.id);
            expect(doc2.id).to.equal(newDoc.id);
            expect(doc2.id).to.equal(doc.id);
            expect(doc2.name).to.equal(newDoc.name);
        })

        it("getHistory", async () => {
            const doc = await cacheHistory(sample);
            assert(isRxDocument(doc));
            const retrievedDoc = await getHistory(doc.id);
            expect(retrievedDoc).not.to.be.null;
            assert(isRxDocument(retrievedDoc));
            expect(doc.toJSON()).to.deep.equal(retrievedDoc.toJSON());
        })

        it("uncacheHistory", async() => {
            const doc = await cacheHistory(sample);
            assert(isRxDocument(doc));
            const deletedDoc = await uncacheHistory(doc);
            assert(isRxDocument(deletedDoc));
            assert(deletedDoc.deleted);
            const doc2 = await getHistory(sample.id);
            expect(doc2).to.be.null;
        })

    })

    describe("content operations", () => {

        const sample = testContent;

        it("should make a blank content", async () => {
            const doc = await newContent();
            assert(isRxDocument(doc));
        })

        it("cacheContent: insert", async () => {
            const doc = await cacheContent(sample);
            assert(isRxDocument(doc));
            expect(doc.type_id).to.equal(sample.type_id);
        })

        it("cacheContent: update", async () => {

            // save it
            const doc = await cacheContent(sample);
            assert(isRxDocument(doc));
            expect(doc.type_id).to.equal(sample.type_id);

            // make a new doc out fo that old doc
            // because that's how lame the rxdb api is
            const newDoc = await newContent(doc.toJSON());
            newDoc.name = "nonsense";

            // check to see if it gets saved
            const doc2 = await cacheContent(newDoc);
            assert(isRxDocument(doc2));
            expect(doc2.type_id).to.equal(sample.type_id);
            expect(doc2.type_id).to.equal(newDoc.type_id);
            expect(doc2.type_id).to.equal(doc.type_id);
            expect(doc2.name).to.equal(newDoc.name);
        })

        it("getContent", async () => {
            const doc = await cacheContent(sample);
            assert(isRxDocument(doc));
            const retrievedDoc = await getContent(doc.type_id);
            assert(isRxDocument(retrievedDoc))
            expect(doc.toJSON()).to.deep.equal(retrievedDoc.toJSON());
        })

        it("uncacheContent", async() => {
            const doc = await cacheContent(sample);
            assert(isRxDocument(doc));
            const deletedDoc = await uncacheContent(doc);
            assert(isRxDocument(deletedDoc));
            assert(deletedDoc.deleted);
            const doc2 = await getContent(sample.id);
            expect(doc2).to.be.null;
        })

    })

    describe("dataset operations", () => {

        const sample = testDataset;

        it("should make a blank dataset", async () => {
            const doc = await newDataset();
            assert(isRxDocument(doc));
        })

        it("cacheDataset: insert", async () => {
            const doc = await cacheDataset(sample);
            assert(isRxDocument(doc));
            expect(doc.id).to.equal(sample.id);
        })

        it("cacheDataset: update", async () => {

            // save it
            const doc = await cacheDataset(sample);
            assert(isRxDocument(doc));
            expect(doc.id).to.equal(sample.id);

            // make a new doc out fo that old doc
            // because that's how lame the rxdb api is
            const newDoc = await newDataset(doc.toJSON());
            newDoc.name = "nonsense";

            // check to see if it gets saved
            const doc2 = await cacheDataset(newDoc);
            assert(isRxDocument(doc2));
            expect(doc2.id).to.equal(sample.id);
            expect(doc2.id).to.equal(newDoc.id);
            expect(doc2.id).to.equal(doc.id);
            expect(doc2.name).to.equal(newDoc.name);
        })

        it("getDataset", async () => {
            const doc = await cacheDataset(sample);
            assert(isRxDocument(doc));
            const retrievedDoc = await getDataset(doc.id);
            assert(isRxDocument(retrievedDoc));
            expect(doc.toJSON()).to.deep.equal(retrievedDoc.toJSON());
        })

        it("uncacheDataset", async() => {
            const doc = await cacheDataset(sample);
            assert(isRxDocument(doc));
            const deletedDoc = await uncacheDataset(doc);
            assert(isRxDocument(deletedDoc));
            assert(deletedDoc.deleted);
            const doc2 = await getDataset(sample.id);
            expect(doc2).to.be.null;
        })

    })

    describe("dataset collection operations", () => {

        const sample = testDatasetCollection;

        it("should make a blank dataset collection", async () => {
            const doc = await newDatasetCollection();
            assert(isRxDocument(doc));
        })

        it("cacheDatasetCollection: insert", async () => {
            const doc = await cacheDatasetCollection(sample);
            assert(isRxDocument(doc));
            expect(doc.id).to.equal(sample.id);
        })

        it("cacheDatasetCollection: update", async () => {

            // save it
            const doc = await cacheDatasetCollection(sample);
            assert(isRxDocument(doc));
            expect(doc.id).to.equal(sample.id);

            // make a new doc out fo that old doc
            // because that's how lame the rxdb api is
            const newDoc = await newDatasetCollection(doc.toJSON());
            newDoc.name = "nonsense";

            // check to see if it gets saved
            const doc2 = await cacheDatasetCollection(newDoc);
            assert(isRxDocument(doc2));
            expect(doc2.id).to.equal(sample.id);
            expect(doc2.id).to.equal(newDoc.id);
            expect(doc2.id).to.equal(doc.id);
            expect(doc2.name).to.equal(newDoc.name);
        })

        it("getDatasetCollection", async () => {
            const doc = await cacheDatasetCollection(sample);
            assert(isRxDocument(doc));
            const retrievedDoc = await getDatasetCollection(doc.id);
            assert(isRxDocument(retrievedDoc));
            expect(doc.toJSON()).to.deep.equal(retrievedDoc.toJSON());
        })

        it("uncacheDatasetCollection", async() => {
            const doc = await cacheDatasetCollection(sample);
            assert(isRxDocument(doc));
            const deletedDoc = await uncacheDatasetCollection(doc);
            assert(isRxDocument(deletedDoc));
            assert(deletedDoc.deleted);
            const doc2 = await getDataset(sample.id);
            expect(doc2).to.be.null;
        })

    })

})
