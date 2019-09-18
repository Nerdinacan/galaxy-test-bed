import assert from "assert";
import { Validator } from "jsonschema";
import schema from "./datasetCollection.schema";
// import testData from "../testdata/datasetCollection.json";
import testData from "../testdata/broke.json";

describe("datasetCollection schema", () => {

    const v = new Validator();

    it("should validate some test data", () => {
        assert(v);
        assert(schema);
        assert(testData);
        let result = v.validate(testData, schema);
        assert(result);
        if (!result.valid) {
            result.errors.forEach(err => {
                console.log(err.property, err.message);
            })
        }
        assert(result.valid);
    })

})
