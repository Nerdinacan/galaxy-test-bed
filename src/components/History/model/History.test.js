/* global __rewire_reset_all__ */
import sinon from "sinon";
import { expect } from "chai";

import { of, Subject, pipe, Observable, isObservable } from "rxjs";
import { tap, mergeMap, take, takeUntil } from "rxjs/operators";

import {
    HistoryCache,
    addHistoryToCache,
    deleteHistoryFromCache,
    __RewireAPI__ as rw
} from "./History";

import { cacheHistory } from "./caching";
import { wipeDatabase } from "./caching/db";
import sampleHistories from "./historyStore/testdata/histories.json";
import oneHistory from "./historyStore/testdata/history.json";

// we use a lot of listeners in here
process.setMaxListeners(0);



describe("model/History.js", () => {

    afterEach(__rewire_reset_all__);
    afterEach(async () => await wipeDatabase());

    /**
     * These two functions add or remove modified history objects
     * from a queue that adds or removes the indicated object
     * from the IndexDB cache.
     */

    describe("cache queues", () => {

        const testVal = "floob";

        let sub;
        afterEach(() => {
            if (sub) sub.unsubscribe();
            sub = null;
        })

        describe("addHistoryToCache", () => {

            it("should be a function", () => {
                expect(addHistoryToCache).to.be.an.instanceOf(Function);
            })

            it("should expose an observable property", () => {
                expect(addHistoryToCache.$).to.be.an.instanceOf(Observable);
                expect(isObservable(addHistoryToCache.$)).to.be.true;
            })

            it("observable should emit when function is called", done => {
                const testVal = "floob";
                const nextHandler = sinon.fake();
                sub = addHistoryToCache.$.pipe(
                    take(1)
                ).subscribe({
                    next: nextHandler,
                    complete: () => {
                        expect(nextHandler.called).to.be.true;
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
                expect(isObservable(deleteHistoryFromCache.$)).to.be.true;
            })

            it("observable should emit when function is called", done => {
                const nextHandler = sinon.fake();
                sub = deleteHistoryFromCache.$.pipe(
                    take(1)
                ).subscribe({
                    next: nextHandler,
                    complete: () => {
                        expect(nextHandler.called).to.be.true;
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

        let userId$, sub, firstId;

        // insert some test histories into the cache
        beforeEach(async () => {

            // jam the hsitories ito the cache with the promise function
            const promises = sampleHistories.map(cacheHistory);
            const result = await Promise.all(promises);

            // make an observable of the user id on all these samples
            firstId = result[0].user_id;
            userId$ = of(firstId);
        })

        afterEach(() => {
            if (sub) sub.unsubscribe();
            sub = null;
        })

        it("should emit a list of histories upon subscription", done => {

            const historyHandler = sinon.fake();
            const idWatcher = sinon.fake();

            sub = userId$.pipe(
                tap(idWatcher),
                HistoryCache(),
                take(1)
            ).subscribe({
                next: historyHandler,
                complete: () => {
                    expect(idWatcher.called).to.be.true;
                    expect(idWatcher.firstCall.args[0]).to.equal(firstId);
                    expect(historyHandler.called).to.be.true;
                    const list = historyHandler.firstCall.args[0];
                    expect(list.length).to.equal(sampleHistories.length);
                    done();
                }
            })
        })

        it("should emit an updated list when a history is added to the cache queue", done => {

            // hijack ajax call
            // rw.__Rewire__("getHistories", async () => []);

            // track when we insert the new history into the cache
            let addedItem = false;

            // watcher funcs
            const historyHandler = sinon.fake();
            const idWatcher = sinon.fake();

            sub = userId$.pipe(
                tap(idWatcher),
                HistoryCache(),
                take(2),
                tap(() => {
                    if (!addedItem) {
                        addHistoryToCache(oneHistory);
                        addedItem = true;
                    }
                })
            ).subscribe({
                next: historyHandler,
                complete: () => {

                    // only got one user id
                    expect(idWatcher.called).to.be.true;
                    expect(idWatcher.firstCall.args[0]).to.equal(firstId);

                    // but we added something to the initial history list
                    expect(historyHandler.called).to.be.true;
                    expect(historyHandler.getCalls().length).to.equal(2);
                    const list = historyHandler.firstCall.args[0];
                    expect(list.length).to.equal(sampleHistories.length);
                    const lastList = historyHandler.lastCall.args[0];
                    expect(lastList.length).to.equal(sampleHistories.length + 1);

                    done();
                }
            })
        })

        it("should emit an updated list when a history is removed from the cache queue", done => {

            // hijack ajax call
            // rw.__Rewire__("getHistories", async () => []);

            // track when we insert the new history into the cache
            // let removedItem = false;

            // watcher funcs
            const historyHandler = sinon.fake();
            const idWatcher = sinon.fake();

            sub = userId$.pipe(
                tap(idWatcher),
                HistoryCache(),
                take(2),
                tap(val => {
                    const thing = val;
                    debugger;
                })
                // tap(list => {
                //     if (!removedItem) {
                //         deleteHistoryFromCache(list[0]);
                //         removedItem = true;
                //     }
                // })
            ).subscribe({
                next: historyHandler,
                complete: () => {

                    // only got one user id
                    expect(idWatcher.called).to.be.true;
                    expect(idWatcher.firstCall.args[0]).to.equal(firstId);

                    // but we removed something to the initial history list
                    expect(historyHandler.called).to.be.true;
                    expect(historyHandler.getCalls().length).to.equal(2);
                    // const list = historyHandler.firstCall.args[0];
                    // expect(list.length).to.equal(sampleHistories.length);
                    // const lastList = historyHandler.lastCall.args[0];
                    // expect(lastList.length).to.equal(sampleHistories.length - 1);

                    done();
                }
            })

        });

        // describe("buildLiveHistoryQuery", () => {})
        // describe("buildUpdateStreams", () => {})
        // describe("loadUserHistories", () => {})
        // describe("loadFreshHistories", () => {})
        // describe("historyLastChanged", () => {})

    })

    /**
     * User CRUD operations, most perform an ajax operation, then
     * register the results of that operation with addHistoryToCache
     * or deleteHistoryFromCache
     */
    describe("operations", () => {
        describe("createNewHistory", () => {})
        describe("copyHistory", () => {})
        describe("deleteHistory", () => {})
        describe("makeHistoryPrivate", () => {})
        describe("updateHistoryFields", () => {})
    })

})





// // Timing util, stops a hot observable with a takeUntil

// // const stopEvent = new Subject();
// // const stop = () => stopEvent.next(1);
// // const nudge = (config = {}) => {
// //     let { duration = 100 } = config;
// //     let timeout;
// //     return pipe(
// //         tap(() => {
// //             if (timeout) clearTimeout(timeout);
// //             timeout = setTimeout(stop, duration);
// //         })
// //     )
// // }


// // result validation utils

// const userId = sampleHistories[0].user_id;
// const sampleIds = sampleHistories.map(h => h.id);
// const validateId = id => expect(sampleIds).to.include(id);
// const validateHistories = list => list.map(h => h.id).forEach(validateId);



// xdescribe("HistoryCache", () => {

//     beforeEach(() => {
//         const fakeCreateHistory = async () => null;
//         const fakeLoadUserHistories = () => pipe(
//             tap(() => console.log("fakeLoadUserHistories")),
//             mergeMap(() => of(sampleHistories))
//         );
//         rw.__Rewire__("createHistory", fakeCreateHistory)
//         rw.__Rewire__("loadUserHistories", fakeLoadUserHistories);
//     })

//     it("should emit the initial contents of the database", done => {

//         const nextFake = sinon.fake(validateHistories);

//         of(userId).pipe(
//             HistoryCache(),
//             take(sampleHistories.length),
//         ).subscribe({
//             next: nextFake,
//             complete: () => {
//                 expect(nextFake.called).to.be.true;
//                 const lastList = nextFake.lastCall.args[0];
//                 validateHistories(lastList);
//                 done();
//             }
//         })
//     })

//     // xit("should emit fresh results when a new result is cached", done => {

//     //     // const nextFake = sinon.fake(list => {
//     //     //     console.log("list", list.length);
//     //     // })

//     //     // of(userId).pipe(
//     //     //     HistoryCache(),
//     //     //     takeUntil(stopEvent),
//     //     //     nudge({ duration: 10 })
//     //     // ).subscribe({
//     //     //     next: nextFake,
//     //     //     complete: () => {
//     //     //         expect(nextFake.called).to.be.true;
//     //     //         const lastList = nextFake.lastCall.args[0];
//     //     //         validateHistories(lastList);
//     //     //         done();
//     //     //     }
//     //     // })

//     //     // addHistoryToCache(oneHistory);
//     // })

//     // xit("should emit when a history is removed from the cache", done => {
//     //     done()
//     // })

// })
