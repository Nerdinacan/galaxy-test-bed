/* global __rewire_reset_all__ */
import sinon from "sinon";
import assert from "assert";
import { expect } from "chai";

import { of, Observable, isObservable, Subject } from "rxjs";
import { tap, take, takeUntil, delay } from "rxjs/operators";

import {
    HistoryCache,
    addHistoryToCache,
    deleteHistoryFromCache,
    __RewireAPI__ as rw
} from "./HistoryCache";

import { cacheHistory, uncacheHistory, getHistory } from "../caching";
import { wipeDatabase } from "../caching/db";

import sampleHistories from "../testdata/histories.json";
import oneHistory from "../testdata/history.json";

// we use a lot of listeners in here
// process.setMaxListeners(0);


// cleanup
let sub;
afterEach(async () => {
    if (sub) sub.unsubscribe();
    sub = null;
    sinon.restore();
    __rewire_reset_all__();
    return await wipeDatabase();
})


describe("HistoryCache.js", () => {

    /**
     * These two functions add or remove modified history objects
     * from a queue that adds or removes the indicated object
     * from the IndexDB cache.
     */

    describe("cache queue", () => {

        const testVal = "floob";

        describe("addHistoryToCache", () => {

            it("should be a function", () => {
                expect(addHistoryToCache).to.be.an.instanceOf(Function);
            })

            it("should expose an observable property", () => {
                expect(addHistoryToCache.$).to.be.an.instanceOf(Observable);
                assert(isObservable(addHistoryToCache.$));
            })

            it("observable should emit when function is called", done => {
                const nextHandler = sinon.fake();
                sub = addHistoryToCache.$.pipe(
                    take(1)
                ).subscribe({
                    next: nextHandler,
                    complete: () => {
                        assert(nextHandler.called);
                        expect(nextHandler.getCalls().length).to.equal(1);
                        const firstVal = nextHandler.firstCall.args[0];
                        expect(firstVal).to.equal(testVal);
                        done();
                    }
                })
                addHistoryToCache(testVal);
            })
        })

        describe("deleteHistoryFromCache", () => {

            it("should be a function", () => {
                expect(deleteHistoryFromCache).to.be.an.instanceOf(Function);
            })

            it("should expose an observable property", () => {
                expect(deleteHistoryFromCache.$).to.be.an.instanceOf(Observable);
                assert(isObservable(deleteHistoryFromCache.$));
            })

            it("observable should emit when function is called", done => {
                const nextHandler = sinon.fake();
                sub = deleteHistoryFromCache.$.pipe(
                    take(1)
                ).subscribe({
                    next: nextHandler,
                    complete: () => {
                        assert(nextHandler.called);
                        expect(nextHandler.getCalls().length).to.equal(1);
                        const firstVal = nextHandler.firstCall.args[0];
                        expect(firstVal).to.equal(testVal);
                        done();
                    }
                })
                deleteHistoryFromCache(testVal);
            })
        })
    })


    /**
     * The HistoryCache is an observable that produces the list of
     * available histories when provided with the current user ID.
     */
    describe("HistoryCache", () => {

        // Pre-fill cache with fake stuff

        const firstId = sampleHistories[0].user_id;
        const userId$ = of(firstId);

        beforeEach(async () => {
            rw.__Rewire__("getHistories", async () => []);
            const promises = sampleHistories.map(cacheHistory);
            return await Promise.all(promises);
        });


        // Observable that emits to complete test observable
        // delay duration is kind of big because it's waiting for
        // an update to an observable that looks at the database

        let stop, finished, delayDuration = 200;

        beforeEach(() => {
            stop = new Subject();
            finished = stop.pipe(
                delay(delayDuration)
            );
        })


        it("should emit a list of histories upon subscription", done => {

            const idWatcher = sinon.fake();
            const resultWatcher = sinon.fake(() => {
                stop.next(1);
            });

            sub = userId$.pipe(
                tap(idWatcher),
                HistoryCache(),
                tap(resultWatcher),
                takeUntil(finished)
            ).subscribe({
                complete: () => {

                    // should have received one id
                    assert(idWatcher.called);
                    expect(idWatcher.getCalls().length).to.equal(1);
                    expect(idWatcher.firstCall.args[0]).to.equal(firstId);

                    assert(resultWatcher.called);
                    const list = resultWatcher.firstCall.args[0];
                    expect(list.length).to.equal(sampleHistories.length);

                    done();
                }
            })
        })

        it("should emit an updated list when a history is added to the cache", done => {

            const idWatcher = sinon.fake();
            const historyHandler = sinon.fake();
            const addToCache = sinon.fake(async () => {
                await cacheHistory(oneHistory);
                stop.next(1);
            })

            sub = userId$.pipe(
                tap(idWatcher),
                HistoryCache(),
                tap(historyHandler),
                takeUntil(finished),
                tap(() => {
                    if (!addToCache.called) {
                        addToCache();
                    }
                })
            ).subscribe({
                complete: () => {

                    // only one user id here
                    assert(idWatcher.called);
                    expect(idWatcher.getCalls().length).to.equal(1);
                    expect(idWatcher.firstCall.args[0]).to.equal(firstId);

                    // should have tripped the flag
                    assert(addToCache.called);

                    // we added something to the initial history list
                    assert(historyHandler.called, "should have called the history handler");
                    expect(historyHandler.getCalls().length, "should emit 2 histories").to.equal(2);
                    const list = historyHandler.firstCall.args[0];
                    const lastList = historyHandler.lastCall.args[0];
                    expect(list.length, "should have emitted same number of histories as the samples we loaded").to.equal(sampleHistories.length);
                    expect(lastList.length, "should emit one more item than the sample list").to.equal(sampleHistories.length + 1);

                    done();
                }
            })
        })

        it("should emit an updated list when a history is removed from the cache", done => {

            const idWatcher = sinon.fake();
            const historyHandler = sinon.fake();
            const removeFromCache = sinon.fake(async () => {
                const doc = await getHistory(sampleHistories[0].id);
                await uncacheHistory(doc);
                stop.next(1);
            })

            sub = userId$.pipe(
                tap(idWatcher),
                HistoryCache(),
                tap(historyHandler),
                tap(() => {
                    if (!removeFromCache.called) {
                        removeFromCache();
                    }
                }),
                takeUntil(finished)
            ).subscribe({
                complete: () => {

                    // only got one user id
                    assert(idWatcher.called);
                    expect(idWatcher.getCalls().length).to.equal(1);
                    expect(idWatcher.firstCall.args[0]).to.equal(firstId);

                    // but we removed something to the initial history list
                    assert(historyHandler.called);
                    expect(historyHandler.getCalls().length).to.equal(2);
                    const list = historyHandler.firstCall.args[0];
                    expect(list.length).to.equal(sampleHistories.length);
                    const lastList = historyHandler.lastCall.args[0];
                    expect(lastList.length).to.equal(sampleHistories.length - 1);

                    done();
                }
            })

        })

    })


})
