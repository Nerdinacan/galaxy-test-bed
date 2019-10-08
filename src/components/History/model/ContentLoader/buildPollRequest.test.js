/* global __rewire_reset_all__ */
import sinon from "sinon";
import assert from "assert";
import { expect } from "chai";

import { of } from "rxjs";
import { map } from "rxjs/operators";

import { SearchParams } from "../SearchParams";
import { cacheHistory } from "../caching";
import { wipeDatabase } from "../caching/db";

import {
    buildPollRequest,
    buildHistoryUrl,
    buildContentsUrl,
    __RewireAPI__ as rw
} from "./buildPollRequest";

import sampleHistories from "../testdata/histories.json";

describe("ContentLoader/buildPollRequest", () => {

    let sub, ajaxSpy;

    afterEach(() => {
        if (sub) sub.unsubscribe();
        sub = null;
        sinon.restore();
        __rewire_reset_all__();
    })

    describe("buildPollRequest", () => {

        // make some params that match the test content
        const firstHistory = sampleHistories[0];
        const testParams = SearchParams.createForHistory(firstHistory);

        // pre-populate database, clean afterward
        beforeEach(() => Promise.all(sampleHistories.map(cacheHistory)));
        afterEach(wipeDatabase);

        it("try to make 2 ajax calls, one to update history, and one for content", done => {

            // built fake ajaxGet operator
            const fakeAjaxCall = sinon.fake(() => []);
            ajaxSpy = () => url$ => url$.pipe(map(fakeAjaxCall));
            rw.__Rewire__("ajaxGet", ajaxSpy);

            sub = of(testParams).pipe(
                buildPollRequest()
            ).subscribe({
                error: err => {
                    assert.fail("error should not have been called", err);
                    done();
                },
                complete: () => {
                    assert(fakeAjaxCall.called, "ajaxGet should have been called 2 times");
                    expect(fakeAjaxCall.getCalls().length).to.equal(2);
                    expect(fakeAjaxCall.firstCall.args[0]).to.equal(buildHistoryUrl(firstHistory));
                    expect(fakeAjaxCall.lastCall.args[0]).to.equal(buildContentsUrl(firstHistory));
                    done();
                }
            })
        })

    })

    describe("buildHistoryUrl", () => {

        // Urls update the current history only
        const firstHistory = sampleHistories[0];

        it("should add an id clause = current history id", () => {
            const url = buildHistoryUrl(firstHistory);
            expect(url).to.contain(firstHistory.id);
        })

        it("should add an update clause > current history", () => {
            const url = buildHistoryUrl(firstHistory);
            expect(url).to.contain(firstHistory.update_time);
        })
    })

    describe("buildContentsUrl", () => {

        // Urls update the current history only
        const firstHistory = sampleHistories[0];

        it("should add an id clause = current history id", () => {
            const url = buildContentsUrl(firstHistory);
            expect(url).to.contain(firstHistory.id);
        })
        it("should add an update clause > current history", () => {
            const url = buildContentsUrl(firstHistory);
            expect(url).to.contain(firstHistory.update_time);
        })
    })
})
