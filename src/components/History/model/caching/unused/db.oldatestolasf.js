import { expect } from "chai";
import sinon from "sinon";
import { forkJoin } from "rxjs";
import { take, filter } from "rxjs/operators";
import { isRxDatabase, isRxCollection } from "rxdb";

import {
    db$,
    dbInstance,
    wipeDatabase,
    history$,
    historyContent$,
    dataset$,
    datasetCollection$
} from "./db";


describe("caching", () => {

    let subs = [];

    afterEach(() => {
        subs.forEach(sub => sub.unsubscribe());
        subs.length = 0;
    })

    describe("db$", () => {

        it("should emit an rxdb database instance", done => {

            const dbSub = db$.subscribe(db => {
                expect(isRxDatabase(db));
                done();
            })

            subs.push(dbSub);
        })

        it("delivers only one instance no matter how many times we subscribe", done => {

            let instance, subCount = 10

            const ray = Array(subCount).fill();
            const manySubs = ray.map(() => db$.pipe(take(1)));
            const waitForAll = forkJoin(manySubs);

            const bulkSub = waitForAll.subscribe({
                next: rxdbArray => {
                    expect(rxdbArray.length).to.equal(subCount);
                    rxdbArray.forEach(rxdb => {
                        if (!instance) instance = rxdb;
                        expect(isRxDatabase(rxdb)).to.be.true;
                        expect(rxdb === instance).to.be.true;
                        expect(rxdb === dbInstance.value).to.be.true;
                    })
                },
                complete: done
            })

            subs.push(bulkSub);
        })

    })

    describe("wipeDatabase", () => {

        it("should erase the data and the db instance", done => {

            let weWipedIt = false;

            // wipe the database on the 1st call,
            // should push a null through to 2nd call
            const fakeNext = sinon.fake(rxdb => {
                expect(isRxDatabase(rxdb)).to.be.true;
                expect(isRxDatabase(dbInstance.value)).to.be.true;
                expect(dbInstance.value).to.equal(rxdb);
                if (!weWipedIt) {
                    wipeDatabase();
                    weWipedIt = true;
                }
            });

            // check to see a null went into the instance
            const nullInstanceNext = sinon.fake();
            const nullInstance = dbInstance.pipe(filter(val => val === null));
            const nullInstanceSub = nullInstance.subscribe({
                next: nullInstanceNext
            });

            const dbSub = db$.pipe(take(2)).subscribe({
                next: fakeNext,
                complete: () => {

                    // get the passed values
                    expect(fakeNext.called).to.be.true;
                    expect(fakeNext.getCalls().length).to.equal(2);
                    expect(nullInstanceNext.called).to.be.true;
                    const firstResponse = fakeNext.firstCall.args[0];
                    const lastResponse = fakeNext.lastCall.args[0];

                    // should both be databases
                    expect(isRxDatabase(firstResponse)).to.be.true;
                    expect(isRxDatabase(lastResponse)).to.be.true;

                    // same db but different db instance because we destroyed first
                    expect(firstResponse.name == lastResponse.name).to.be.true;
                    expect(firstResponse.adapter == lastResponse.adapter).to.be.true;
                    expect(firstResponse).to.not.equal(lastResponse);

                    // cleanup
                    done();
                }
            });

            subs.push(nullInstanceSub, dbSub);
        })

    })

    describe("collections", () => {

        // Very basic tests right now, should make more

        // functionalizing basic tests
        const singleSubscriptionTest = (collection$, done) => {
            const sub = collection$.pipe(take(1)).subscribe({
                next: val => {
                    expect(isRxCollection(val)).to.be.true;
                    done();
                }
            })
            subs.push(sub);
        }

        const multiSubscriptionTest = (collection$, done, subCount = 10) => {

            let instance;

            const ray = Array(subCount).fill();
            const manySubs = ray.map(() => collection$.pipe(take(1)));
            const waitForAll = forkJoin(manySubs);

            const bulkSub = waitForAll.subscribe({
                next: rxdbArray => {
                    expect(rxdbArray.length).to.equal(subCount);
                    rxdbArray.forEach(rxColl => {
                        if (!instance) instance = rxColl;
                        expect(isRxCollection(rxColl)).to.be.true;
                        expect(rxColl === instance).to.be.true;
                    })
                },
                complete: done
            })

            subs.push(bulkSub);
        }

        const rebuildAfterWipeTest = (collection$, done) => {

            let wiped = false;

            // watch db observable, wipe after first request
            const wipeAfterFirst = sinon.fake(() => {
                if (!wiped) {
                    wipeDatabase().then(() => {
                        wiped = true;
                    })
                }
            })

            const dbSub = db$.subscribe({
                next: wipeAfterFirst
            })

            // watch history$ collection observable
            const collNext = sinon.fake()
            const sub = collection$.pipe(take(2)).subscribe({
                next: collNext,
                complete: () => {
                    expect(wipeAfterFirst.called).to.be.true;
                    expect(collNext.called).to.be.true;
                    expect(collNext.getCalls().length).to.equal(2);
                    const firstCollection = collNext.firstCall.args[0];
                    const lastCollection = collNext.lastCall.args[0];
                    expect(isRxCollection(firstCollection)).to.be.true;
                    expect(isRxCollection(lastCollection)).to.be.true;
                    expect(firstCollection).to.not.equal(lastCollection);
                    done();
                }
            })

            subs.push(dbSub, sub);
        }

        describe("history$", () => {
            it("subscribing should emit an rxdb collection", done => {
                singleSubscriptionTest(history$, done);
            })
            it("should subscribe multiple times and return the same collection", done => {
                multiSubscriptionTest(history$, done);
            })
            it("should rebuild the collection after we wipe the db instance", done => {
                rebuildAfterWipeTest(history$, done);
            })
        })

        describe("historyContent$", () => {
            it("subscribing should emit an rxdb collection", done => {
                singleSubscriptionTest(historyContent$, done);
            })
            it("should subscribe multiple times and return the same collection", done => {
                multiSubscriptionTest(historyContent$, done);
            })
            it("should rebuild the collection after we wipe the db instance", done => {
                rebuildAfterWipeTest(historyContent$, done);
            })
        })

        describe("dataset$", () => {
            it("subscribing should emit an rxdb collection", done => {
                singleSubscriptionTest(dataset$, done);
            })
            it("should subscribe multiple times and return the same collection", done => {
                multiSubscriptionTest(dataset$, done);
            })
            xit("should rebuild the collection after we wipe the db instance", done => {
                rebuildAfterWipeTest(dataset$, done);
            })
        })

        describe("datasetCollection$", () => {
            it("subscribing should emit an rxdb collection", done => {
                singleSubscriptionTest(datasetCollection$, done);
            })
            it("should subscribe multiple times and return the same collection", done => {
                multiSubscriptionTest(datasetCollection$, done);
            })
            xit("should rebuild the collection after we wipe the db instance", done => {
                rebuildAfterWipeTest(datasetCollection$, done);
            })
        })

    })

})
