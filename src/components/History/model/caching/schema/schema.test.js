import assert from "assert";
import { Validator } from "jsonschema";

import historySchema from "./history.schema";
import historyTestData from "../../testdata/history.json";

import contentSchema from "./historyContent.schema";
import contentTestData from "../../testdata/content.json";

import datasetSchema from "./dataset.schema";
import datasetCollectionSchema from "./datasetCollection.schema";

import datasetTestData from "../../testdata/dataset.json";
import datasetCollectionTestData from "../../testdata/broke.json";


describe("caching/schema", () => {


    describe("history", () => {

        let v = new Validator();

        it("should validate some test data", () => {
            let result = v.validate(historyTestData, historySchema);
            assert(result);
            if (!result.valid) {
                result.errors.forEach(err => {
                    console.log(err.property, err.message);
                })
            }
            assert(result.valid);
        })
    })


    describe("content", () => {

        let v = new Validator();

        it("should validate some test data", () => {
            let result = v.validate(contentTestData, contentSchema);
            assert(result);
            if (!result.valid) {
                result.errors.forEach(err => {
                    console.log(err.property, err.message);
                })
            }
            assert(result.valid);
        })
    })


    describe("dataset", () => {

        let v = new Validator();

        it("should validate some test data", () => {
            let result = v.validate(datasetTestData, datasetSchema);
            assert(result);
            if (!result.valid) {
                result.errors.forEach(err => {
                    console.log(err.property, err.message);
                })
            }
            assert(result.valid);
        })

    })

    describe("datasetCollection", () => {

        const v = new Validator();

        it("should validate some test data", () => {
            let result = v.validate(datasetCollectionTestData, datasetCollectionSchema);
            assert(result);
            if (!result.valid) {
                result.errors.forEach(err => {
                    console.log(err.property, err.message);
                })
            }
            assert(result.valid);
        })

    })


})