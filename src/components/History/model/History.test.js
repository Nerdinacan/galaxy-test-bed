
/* global __rewire_reset_all__ */

/**
 * History contains a set of functions for manipulating the cached
 * versions of the list of available histories.
 */

import RxDB from "rxdb";
import assert from "assert";
import { expect } from "chai";
import sinon from "sinon";
import { of, from, isObservable, pipe } from "rxjs";
import { tap, map, take, mergeMap } from "rxjs/operators";
import moment from "moment";

import {
    addToHistoryCache,
    deleteHistoryFromCache,
    historyCacheQuery,
    loadFreshHistories,
    historyLastChanged,
    buildUpdateStreams,
    __RewireAPI__ as historyRewire
} from "./History";

// load test config so we can get the vars to destroy the db
import dbConfig from "components/History/model/caching/config";



const cleanup = () => {
    __rewire_reset_all__();
    RxDB.removeDatabase(dbConfig.name, dbConfig.adapter);
}


describe("history model functions", () => {

    // Un-monkeypatch all rewired dependencies
    afterEach(cleanup);


    // addToHistoryCache and deleteHistoryFromCache create both a
    // function for changing the cache and emit an observable for
    // the streams that do the actual work. These functions should
    // be called after all ajax interactions with the server to sync
    // the local database.

    describe("observable inputs", () => {

        describe("addToHistoryCache", () => {

            it("should have an observable property", () => {
                expect(addToHistoryCache.$).to.exist;
                assert(isObservable(addToHistoryCache.$));
            })

            it("should be a function", () => {
                expect(addToHistoryCache).to.be.a("function");
            })

            it("should emit a new value from the observable when the function is called", done => {
                const testVal = "abc";
                addToHistoryCache.$.subscribe({
                    next: val => {
                        expect(val).to.equal(testVal);
                        done();
                    }
                })
                addToHistoryCache(testVal);
            })
        })

        describe("deleteHistoryFromCache", () => {

            it("should have an observable property", () => {
                expect(deleteHistoryFromCache.$).to.exist;
                assert(isObservable(deleteHistoryFromCache.$));
            })

            it("should be a function", () => {
                expect(deleteHistoryFromCache).to.be.a("function");
            })

            it("should emit a new value from the observable when the function is called", done => {
                const testVal = "abc";
                deleteHistoryFromCache.$.subscribe({
                    next: val => {
                        expect(val).to.equal(testVal);
                        done();
                    }
                })
                deleteHistoryFromCache(testVal);
            })
        })
    })


    // RxDB's interface exposes observable for arbitrary IndexDB
    // queries. So what we do is create a query to listen to the
    // histories that belong to the current user, listen to changes
    // to that query, then update the store with the end results.

    describe("HistoryCache", () => {


        const histories = [ 1, 2, 3 ].map(i => ({
            update_time: moment.utc(i * 10000).toISOString()
        }));

        const lastHistory = histories[histories.length - 1];

        xdescribe("HistoryCache", () => {})

        xdescribe("buildLiveHistoryQuery", () => {})

        describe("historyCacheQuery", () => {

            it("should produce a query with the passed id", done => {
                const testId = "abc";
                of(testId).pipe(
                    historyCacheQuery()
                ).subscribe({
                    next: query => {
                        expect(query.mquery._conditions.user_id).to.not.be.undefined;
                        expect(query.mquery._conditions.user_id).to.equal(testId);
                    },
                    complete: done
                })
            })

        })

        describe("loadFreshHistories", () => {

            it("should load the histories after the calculated update_time", async () => {

                // mock local query object, return existing history list
                const query = {};
                query.exec = async () => histories;

                // rewire internal getHistories method, return one new history
                // whose value is later than updateTime
                historyRewire.__Rewire__("getHistories", async updateTime => {
                    const oneHourLater = moment.utc(updateTime).add(1, 'h').toISOString();
                    return [ { update_time: oneHourLater } ];
                })

                const newHistories = await loadFreshHistories(query);
                expect(newHistories.length).to.equal(1);
                expect(newHistories.update_time)
            })

        })

        describe("historyLastChanged", () => {

            const minDateString = moment.utc(0).toISOString();

            it("should return some default value if no histories", () => {
                const result = historyLastChanged([]);
                expect(result).to.be.a("string");
                expect(moment.utc(result).toISOString()).to.equal(minDateString);
            })

            it("should return the latest update_time", () => {
                const result = historyLastChanged(histories);
                expect(result).to.be.a("string");
                expect(moment.utc(result).toISOString()).to.equal(lastHistory.update_time);
            })
        })

        describe("buildUpdateStreams", () => {

            let sub;

            // emits fake histories
            const loadSpy = sinon.fake(() => from(histories));
            const fakeLoadUserHistories = () => pipe(
                mergeMap(loadSpy)
            )

            const cacheSpy = sinon.fake(o => o);
            const fakeCacheHistory = () => pipe(
                map(cacheSpy)
            )

            const deleteSpy = sinon.fake(o => onbeforeprint);
            const fakeWipeCachedHistory = () => pipe(
                map(deleteSpy)
            )

            // stub out internal dependencies. We just want to make
            // sure they're getting called
            beforeEach(() => {
                historyRewire.__Rewire__("loadUserHistories", fakeLoadUserHistories);
                historyRewire.__Rewire__("cacheHistory", fakeCacheHistory);
                historyRewire.__Rewire__("wipeCachedHistory", fakeWipeCachedHistory);
            })

            afterEach(() => {
                loadSpy.resetHistory();
                cacheSpy.resetHistory();
                deleteSpy.resetHistory();
                sub.unsubscribe();
            })

            it("should load histories when created", done => {

                const testId = "abc";

                sub = of(testId).pipe(
                    buildUpdateStreams(),
                    take(histories.length)
                ).subscribe({
                    complete: () => {
                        assert(loadSpy.calledOnce);
                        done();
                    }
                })
            })

            it("should call the cache function for each history", done => {

                const testId = "abc";

                sub = of(testId).pipe(
                    buildUpdateStreams(),
                    take(histories.length)
                ).subscribe({
                    complete: () => {
                        assert(cacheSpy.getCalls().length == histories.length);
                        done();
                    }
                })
            })

            it("should load histories when the id changes", () => {

            })

            xit("should run cacheHistory when a history is added", () => {})

            xit("should run wipeCachedHistory when a history is removed", () => {})
        })
    })


    // These function are basically just CRUD. They each do one or more
    // ajax calls then update the IndexDB cache appropriately. It's not
    // necessary to interact with Vuex directly since Vuex gets all the
    // changes through listenToHistoryCache.

    describe("history operations", () => {
        describe("createNewHistory", () => {})
        describe("copyHistory", () => {})
        describe("makeHistoryPrivate", () => {})
        describe("updateHistoryFields", () => {})
    })

})
