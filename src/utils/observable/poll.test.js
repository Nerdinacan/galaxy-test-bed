import { of } from "rxjs";
import { take } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";
import { poll } from "./poll";


describe("poll operator", () => {
    
    const testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).deep.equal(expected);
    });

    // const polling$ = historyId$.pipe(
    //     takeUntil(stopPolling.$),
    //     poll({ buildRequest, reTriggers: manual$, delayTime: 1000 })
    // )

    it("should emit, complete, then restart", () => {

        testScheduler.run(helpers => {
            const { cold, expectObservable, expectSubscriptions } = helpers;

            const buildRequest = of('b');
            const expected = 'bbb|';

            const polling$ = of('a').pipe(poll({ buildRequest }),take(3));

            expectObservable(polling$).toBe(expected);
            // expectSubscriptions(e1.subscriptions).toBe(subs);
        })

        // const testo = interval(100).pipe(take(2));
        // const results = [];

        // testo.subscribe({
        //     next: result => {
        //         console.log(result);
        //         results.push(result);
        //     },
        //     complete: () => {
        //         assert(results.length == 2);
        //         done();
        //     }
        // });

    })

})