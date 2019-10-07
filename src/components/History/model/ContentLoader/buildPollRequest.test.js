/* global __rewire_reset_all__ */
import sinon from "sinon";
import { expect } from "chai";

import {
    buildPollRequest,
    buildHistoryUrl,
    buildContentUrlForHistory,
    __RewireAPI__ as rw
} from "./buildPollRequest";


// cleanup
let sub;
afterEach(async () => {
    if (sub) sub.unsubscribe();
    sub = null;
    sinon.restore();
    __rewire_reset_all__();
    // return await wipeDatabase();
})


describe("ContentLoader/buildPollRequest", () => {

    describe("buildPollRequest", () => {
        it("should do things", () => {
            expect(true);
        })
    })

    describe("buildHistoryUrl", () => {
        it("should do things", () => {
            expect(true);
        })
    })

    describe("buildContentUrlForHistory", () => {
        it("should do things", () => {
            expect(true);
        })
    })
})
