import { Validator } from "jsonschema";
import schema from "./dataset.schema";
import testData from "../testdata/dataset.json";
import assert from "assert";

describe("dataset schema", () => {

    let v = new Validator();

    it("should validate some test data", () => {
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
