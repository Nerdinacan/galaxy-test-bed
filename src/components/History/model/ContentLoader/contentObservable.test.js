/* global __rewire_reset_all__ */
import sinon from "sinon";
import { expect } from "chai";
import assert from "assert";

import { of, isObservable } from "rxjs";
import { tap, take } from "rxjs/operators";

import { cacheContent } from "../caching";
import { wipeDatabase } from "../caching/db";
import { contentObservable } from "./contentObservable";
import { SearchParams } from "../SearchParams";
import { Content } from "../Content";

// test data
import testHistory from "../testdata/history.json";
import testContent from "../testdata/contents.json";


// cleanup
let sub;
afterEach(async () => {
    if (sub) sub.unsubscribe();
    sub = null;
    sinon.restore();
    __rewire_reset_all__();
})


describe("ContentLoader/contentObservable", () => {

    const testParams = SearchParams.createForHistory(testHistory);

    describe("contentObservable (empty db)", () => {

        it("should produce an observable from a set of params", done => {
            const obs$ = of(testParams).pipe(contentObservable(), take(1));
            assert(isObservable(obs$), "Should be an observable value");
            sub = obs$.subscribe({
                next: result => {
                    expect(result).to.deep.equal([]);
                    expect(result).to.be.instanceOf(Array);
                    expect(result.length).to.equal(0);
                },
                error: () => {
                    assert.fail("Error handler should not have been called");
                },
                complete: done
            })
        })

        it("should return an empty array for an empty database", done => {
            const obs$ = of(testParams).pipe(contentObservable());
            assert(isObservable(obs$), "Should be an observable value");
            sub = obs$.subscribe({
                next: result => {
                    expect(result).to.deep.equal([]);
                    expect(result).to.be.instanceOf(Array);
                    expect(result.length).to.equal(0);
                    done();
                },
                error: () => {
                    assert.fail("Error handler should not have been called");
                    done();
                },
                complete: () => {
                    assert.fail("Complete handler should not have been called");
                    done();
                }
            })
        })

        it("observable should error if there's no history id to work with", done => {
            const badParams = testParams.clone();
            badParams.historyId = null;
            const obs$ = of(badParams).pipe(contentObservable());
            sub = obs$.subscribe({
                next: () => {
                    assert.fail("next handler should not have been called");
                    done();
                },
                error: err => {
                    expect(err.message).to.equal("Missing historyId");
                    done();
                },
                complete: () => {
                    assert.fail("complete handler should not have been called");
                    done();
                }
            })
        })
    })

    describe("contentObservable (w/ pre-existing content)", () => {

        // make some params that match the test content
        const testParams = SearchParams.createForHistory(testHistory);
        testParams.historyId = testContent[0].history_id;

        // pre-populate database, clean afterward
        beforeEach(() => Promise.all(testContent.map(cacheContent)));
        afterEach(wipeDatabase);

        it("test params should match sample content", () => {
            expect(testContent.length).to.be.greaterThan(0);
            expect(testParams.historyId).to.equal(testContent[0].history_id);
        })

        it("should return the list of cached content if it already exists in indexdb", done => {

            const obs$ = of(testParams).pipe(contentObservable());

            sub = obs$.subscribe({
                next: results => {
                    expect(results.length).to.equal(testContent.length);
                    results.map(c => {
                        expect(c.history_id).to.equal(testParams.historyId);
                    })
                    done();
                },
                error: () => {
                    assert.fail("error handler should not have been called");
                    done();
                },
                complete: () => {
                    assert.fail("complete handler should not have been called");
                    done();
                }
            })
        })

        it("should emit a new list if the cached content is changed", done => {

            const testName = "floobadooba";

            const changeStuff = sinon.fake(async results => {
                const firstResult = results[0];
                firstResult.name = testName;
                return await cacheContent(firstResult);
            })

            // check results
            const resultHandler = sinon.fake(results => {
                expect(results.length).to.equal(testContent.length);
                results.map(c => {
                    expect(c.history_id).to.equal(testParams.historyId);
                    expect(c, "result should be a Content object").to.be.instanceOf(Content);
                })
            })

            // subscribe to observable, wait for testContent results
            const obs$ = of(testParams).pipe(
                contentObservable(),
                tap(results => {
                    if (!changeStuff.called) {
                        changeStuff(results);
                    }
                }),
                take(2)
            )

            sub = obs$.subscribe({
                next: resultHandler,
                error: () => {
                    assert.fail("error handler should not have been called");
                    done();
                },
                complete: () => {
                    assert(changeStuff.called);
                    expect(resultHandler.getCalls().length).to.equal(2);

                    const firstResult = resultHandler.firstCall.args[0][0];
                    const lastResult = resultHandler.lastCall.args[0][0];
                    expect(firstResult).to.deep.equal(lastResult);

                    expect(lastResult.name).to.equal(testName);
                    done();
                }
            })


        })
    })

    // TODO: test filters
    // set deleted=true, count results
    // set hidden=true count results
    // test filter

})
