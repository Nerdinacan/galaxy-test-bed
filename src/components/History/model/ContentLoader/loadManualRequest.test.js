/* global __rewire_reset_all__ */
import sinon from "sinon";
import { expect } from "chai";

import {
    loadManualRequest,
    __RewireAPI__ as rw
} from "./loadManualRequest";

// cleanup
let sub;
afterEach(async () => {
    if (sub) sub.unsubscribe();
    sub = null;
    sinon.restore();
    __rewire_reset_all__();
    // return await wipeDatabase();
})


describe("ContentLoader/loadManualRequest", () => {

    it("should do things", () => {
        expect(true);
    })

})
