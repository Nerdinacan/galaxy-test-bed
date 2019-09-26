/* global __rewire_reset_all__ */

/**
 * History contains a set of functions for manipulating the cached
 * versions of the list of available histories.
 */

import RxDB from "rxdb";
import assert from "assert";
import { expect } from "chai";
import sinon from "sinon";
import { of, from, isObservable, pipe, empty, Subject, forkJoin } from "rxjs";
import { tap, map, mergeMap, take, takeUntil, debounceTime } from "rxjs/operators";
import moment from "moment";

// we use a lot of listeners in here
process.setMaxListeners(0);

import sampleHistories from "./historyStore/testdata/histories.json";
import oneHistory from "./historyStore/testdata/history.json";

import {
    HistoryCache,
    addToHistoryCache,
    deleteHistoryFromCache,
    historyCacheQuery,
    loadFreshHistories,
    historyLastChanged,
    buildUpdateStreams,
    __RewireAPI__ as historyRewire,
    buildLiveHistoryQuery
} from "./History";

import {
    db$,
    history$,
    cacheHistory
} from "./caching";

import { operateOnArray } from "utils/observable";

// load test config so we can get the vars to destroy the db
import dbConfig from "components/History/model/caching/config";


describe("history model functions", () => {

    const stopObs = new Subject();

    // RxDB's interface exposes observable for arbitrary IndexDB
    // queries. So what we do is create a query to listen to the
    // histories that belong to the current user, listen to changes
    // to that query, then update the store with the end results.

    describe("HistoryCache", () => {

        const histories = [ 1, 2, 3 ].map(i => ({
            id: i + "",
            name: `History #${i}`,
            deleted: false,
            update_time: moment.utc(i * 10000).toISOString()
        }));

        const lastHistory = histories[histories.length - 1];


        describe("HistoryCache", () => {

            const ids = sampleHistories.map(h => h.id);

            const validateAllIds = list => {
                list.forEach(h => expect(ids).to.include(h.id));
            }

            beforeEach(() => {
                const fakeLoadUserHistories = () => pipe(
                    mergeMap(() => of(sampleHistories))
                );
                historyRewire.__Rewire__("loadUserHistories", fakeLoadUserHistories);
            })

            it("should emit the list of histories on subscription", done => {

                const userId$ = of(sampleHistories[0].user_id);

                userId$.pipe(
                    HistoryCache()
                ).subscribe({
                    next: list => {
                        console.log("list", list.length);
                        console.log("ids", list.map(h => h.id));
                    },
                    complete: () => {
                        assert(true);
                        done();
                    }
                })

            })


        })

        // // Might be too specific, like testing
        // // implementations instead of results

        // xdescribe("buildLiveHistoryQuery", () => {

        //     function getHistoryObservable() {
        //         const testUserId = histories[0].user_id;
        //         const historyObs = of(testUserId).pipe(
        //             buildLiveHistoryQuery()
        //         );
        //         return historyObs;
        //     }

        //     function loadOneHistory(h) {
        //         return of(h).pipe(cacheHistory()).toPromise();
        //     }

        //     function loadSampleHistories() {
        //         const obs$ = of(sampleHistories).pipe(
        //             tap(h => console.log("histories?", h.length)),
        //             map(list => {
        //                 return list.map(h => of(h).pipe(
        //                     cacheHistory()))
        //             }),
        //             tap(thing => console.log("thing", thing.length)),
        //             mergeMap(listObs => forkJoin(listObs)),
        //         )
        //         return obs$.toPromise();
        //     }

        //     const ids = sampleHistories.map(h => h.id);

        //     const validateAllIds = list => {
        //         list.forEach(h => expect(ids).to.include(h.id));
        //     }

        //     beforeEach(() => {
        //         return loadSampleHistories().then(thing => {
        //             console.log("load done", thing.length);
        //             return thing;
        //         })
        //     });

        //     afterEach(() => {
        //         console.log("afterEach");
        //         return db$.pipe(
        //             mergeMap(db => {
        //                 console.log("db", db.constructor.name, db.name);
        //                 return db.remove();
        //             })
        //         ).toPromise();
        //     });


        //     it("should emit existing database contents when subscribed", done => {

        //         const next = sinon.fake(validateAllIds);

        //         getHistoryObservable().pipe(
        //             take(1)
        //         ).subscribe({
        //             next,
        //             complete: () => {
        //                 const finalList = next.lastCall.args[0];
        //                 expect(finalList.length).to.equal(sampleHistories.length);
        //                 validateAllIds(finalList);
        //                 done();
        //             }
        //         })
        //     })

        //     it("repeated", done => {

        //         const next = sinon.fake(validateAllIds);

        //         getHistoryObservable().pipe(
        //             take(1)
        //         ).subscribe({
        //             next,
        //             complete: () => {
        //                 const finalList = next.lastCall.args[0];
        //                 expect(finalList.length).to.equal(sampleHistories.length);
        //                 validateAllIds(finalList);
        //                 done();
        //             }
        //         })
        //     })

        //     xit("should respond with a new list when a history is added", done => {

        //         const next = sinon.fake(validateAllIds);

        //         getHistoryObservable().pipe(
        //             take(1)
        //         ).subscribe({
        //             next,
        //             complete: () => {
        //                 const finalList = next.lastCall.args[0];
        //                 expect(finalList.length).to.equal(sampleHistories.length);
        //                 validateAllIds(finalList);
        //                 done();
        //             }
        //         })

        //         // getHistoryObservable().subscribe({
        //         //     next,
        //         //     complete: () => {
        //         //         const finalList = next.lastCall.args[0];
        //         //         expect(finalList.length).to.equal(sampleHistories.length + 1);
        //         //         validateAllIds(finalList);
        //         //         done();
        //         //     }
        //         // })

        //         // loadOneHistory(oneHistory).then(() => {
        //         //     setTimeout(stopEmitting, 200);
        //         // })
        //     })

        // })

        // xdescribe("historyCacheQuery", () => {

        //     it("should produce a query with the passed id", done => {
        //         const testId = "abc";
        //         of(testId).pipe(
        //             historyCacheQuery()
        //         ).subscribe({
        //             next: query => {
        //                 expect(query.mquery._conditions.user_id).to.not.be.undefined;
        //                 expect(query.mquery._conditions.user_id).to.equal(testId);
        //             },
        //             complete: done
        //         })
        //     })

        // })

        // xdescribe("loadFreshHistories", () => {

        //     it("should load the histories after the calculated update_time", async () => {

        //         // mock local query object, return existing history list
        //         const query = {};
        //         query.exec = async () => histories;

        //         // rewire internal getHistories method, return one new history
        //         // whose value is later than updateTime
        //         historyRewire.__Rewire__("getHistories", async updateTime => {
        //             const oneHourLater = moment.utc(updateTime).add(1, 'h').toISOString();
        //             return [ { update_time: oneHourLater } ];
        //         })

        //         const newHistories = await loadFreshHistories(query);
        //         expect(newHistories.length).to.equal(1);
        //         expect(newHistories.update_time)
        //     })

        // })

        // xdescribe("historyLastChanged", () => {

        //     const minDateString = moment.utc(0).toISOString();

        //     it("should return some default value if no histories", () => {
        //         const result = historyLastChanged([]);
        //         expect(result).to.be.a("string");
        //         expect(moment.utc(result).toISOString()).to.equal(minDateString);
        //     })

        //     it("should return the latest update_time", () => {
        //         const result = historyLastChanged(histories);
        //         expect(result).to.be.a("string");
        //         expect(moment.utc(result).toISOString()).to.equal(lastHistory.update_time);
        //     })
        // })

        // xdescribe("buildUpdateStreams", () => {

        //     let sub, loadSpy, cacheSpy, deleteSpy;

        //     // sometimes we need to complete the inputs to turn buildUpdateStreams
        //     // into something that eventually completes, otherwise it'll
        //     // just stay live waiting for adds and subtracts
        //     const emptyInput = function() {
        //         const input = function() {};
        //         input.$ = empty();
        //         return input;
        //     }

        //     // stub out internal dependencies. We just want to make
        //     // sure they're getting called
        //     beforeEach(() => {

        //         // emits fake histories
        //         loadSpy = sinon.fake(() => of(histories));
        //         const fakeLoadUserHistories = () => pipe(mergeMap(loadSpy));

        //         // fake cache operator
        //         cacheSpy = sinon.fake(o => o);
        //         const fakeCacheHistory = () => pipe(map(cacheSpy));

        //         // fake delete-from-cache-operator
        //         deleteSpy = sinon.fake(o => o);
        //         const fakeWipeCachedHistory = () => pipe(map(deleteSpy));

        //         historyRewire.__Rewire__("loadUserHistories", fakeLoadUserHistories);
        //         historyRewire.__Rewire__("cacheHistory", fakeCacheHistory);
        //         historyRewire.__Rewire__("wipeCachedHistory", fakeWipeCachedHistory);
        //     })

        //     afterEach(() => {
        //         loadSpy.resetHistory();
        //         cacheSpy.resetHistory();
        //         deleteSpy.resetHistory();
        //         __rewire_reset_all__();
        //         sub.unsubscribe();
        //     })

        //     it("should load histories when created", done => {

        //         const testId = "abc";

        //         sub = of(testId).pipe(
        //             buildUpdateStreams(),
        //             takeUntil(stopObs)
        //         ).subscribe({
        //             complete: () => {
        //                 expect(loadSpy.calledOnce).to.be.true;
        //                 done();
        //             }
        //         })

        //         stopObs.next(1);
        //     })

        //     it("should call the cache function for each history", done => {

        //         const testId = "abc";

        //         sub = of(testId).pipe(
        //             buildUpdateStreams(),
        //             takeUntil(stopObs)
        //         ).subscribe({
        //             complete: () => {
        //                 expect(cacheSpy.getCalls().length).to.equal(histories.length);
        //                 done();
        //             }
        //         })

        //         stopObs.next(1);
        //     })

        //     it("should load histories when the id changes", done => {

        //         const testId$ = from([ "abc", "def" ]);
        //         const nextCalls = sinon.fake();

        //         // close down the inputs so the test ends
        //         historyRewire.__Rewire__("addToHistoryCache", emptyInput());
        //         historyRewire.__Rewire__("deleteHistoryFromCache", emptyInput());

        //         sub = testId$.pipe(
        //             buildUpdateStreams()
        //         ).subscribe({
        //             next: nextCalls,
        //             complete: () => {
        //                 expect(loadSpy.called).to.be.true;
        //                 assert(nextCalls.getCalls().length == histories.length * 2);
        //                 done();
        //             }
        //         })
        //     })

        //     it("should run cacheHistory when a history is added through the input", done => {

        //         // load nothing
        //         const loadSpy = sinon.fake(() => empty());
        //         const fakeLoadUserHistories = () => pipe(
        //             mergeMap(loadSpy)
        //         );
        //         historyRewire.__Rewire__("loadUserHistories", fakeLoadUserHistories);

        //         // close delete input
        //         historyRewire.__Rewire__("deleteHistoryFromCache", emptyInput());

        //         sub = of("someUserId").pipe(
        //             buildUpdateStreams(),
        //             takeUntil(stopObs)
        //         ).subscribe({
        //             complete: () => {
        //                 expect(cacheSpy.calledOnce).to.be.true;
        //                 expect(cacheSpy.firstCall.calledWith(histories[0])).to.be.true;
        //                 done();
        //             }
        //         })

        //         // add one item to the input
        //         addToHistoryCache(histories[0]);
        //         stopObs.next(1);
        //     })

        //     it("should run wipeCachedHistory when a history is removed through the input", done => {

        //         // load nothing
        //         const loadSpy = sinon.fake(() => empty());
        //         const fakeLoadUserHistories = () => pipe(
        //             mergeMap(loadSpy)
        //         );
        //         historyRewire.__Rewire__("loadUserHistories", fakeLoadUserHistories);

        //         // close add input
        //         historyRewire.__Rewire__("addToHistoryCache", emptyInput());

        //         sub = of("someUserId").pipe(
        //             buildUpdateStreams(),
        //             takeUntil(stopObs),
        //         ).subscribe({
        //             complete: () => {
        //                 expect(deleteSpy.calledOnce).to.be.true;
        //                 expect(deleteSpy.firstCall.calledWith(histories[0])).to.be.true;
        //                 done();
        //             }
        //         })

        //         // add one item to the input
        //         deleteHistoryFromCache(histories[0]);
        //         stopObs.next(1);

        //     })
        // })

    })


    // These function are basically just CRUD. They each do one or more
    // ajax calls then update the IndexDB cache appropriately. It's not
    // necessary to interact with Vuex directly since Vuex gets all the
    // changes through listenToHistoryCache.

    xdescribe("history operations", () => {
        describe("createNewHistory", () => {})
        describe("copyHistory", () => {})
        describe("makeHistoryPrivate", () => {})
        describe("updateHistoryFields", () => {})
    })

})
