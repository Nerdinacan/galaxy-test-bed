import assert from "assert";
import { Validator } from "jsonschema";
import schema from "./history.schema";
import testData from "../testdata/history.json";

describe("history schema", () => {

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
