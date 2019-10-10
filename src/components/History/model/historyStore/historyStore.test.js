import assert from "assert";
import { expect } from "chai";
import { defaultState, historyStore } from "../historyStore";

import {
    setCurrentHistoryId,
    setHistories,
    setContentSelection,
    selectCollection
} from "./mutations";

import {
    currentHistoryId,
    contentSelection,
    getSelectedCollection
} from "./getters";

import testHistories from "../testdata/histories";



describe("model/historyStore", () => {

    let state;
    beforeEach(() => {
        state = Object.assign({}, defaultState);
    })


    // I'm genuinely unsure why people bother testing mutations
    // but then I'm genuinely unsure why people who advocate Vuex
    // can't recognize how poor a tool it is

    describe("mutations", () => {

        it("setCurrentHistoryId", () => {
            const id = testHistories[0].id;
            setCurrentHistoryId(state, id);
            assert(state.currentHistoryId == id);
        })


        // an observable monitors events from server and sets the history
        // list here. Most of the work is actually in the observable so we'll
        // test that a little more thoroughly

        it("setHistories", () => {
            setHistories(state, testHistories);
            assert(state.histories.length == testHistories.length);
            state.histories.forEach((h, i) => {
                expect(h).to.deep.equal(testHistories[i]);
            })
        })


        // Content selections are keyed by history id. This is relevant (and
        // might be a complication) if we ever decide to have multiple views of
        // the same history running. Perhaps views with different filter sets?
        // I'm somewhat in the camp that the selection of content should be local
        // state managed by the component.

        it("setContentSelection", () => {
            const selectedTypeIds = ["dataset-123", "dataset_collection-23423", "dataset-123123"];
            const fakeHistoryId = "nonsense";
            setContentSelection(state, {
                historyId: fakeHistoryId,
                typeIds: selectedTypeIds
            })
            expect(state.contentSelection).to.have.property(fakeHistoryId);
            expect(state.contentSelection[fakeHistoryId]).to.deep.equal(new Set(selectedTypeIds));
        })


        // This is the dataset collection that is currently selected in the UI. When a
        // collection is selected we replace the list of history content with
        // a list of content from the selected dataset collection. I'm almost sure we
        // should make this local state to the History component.

        it("selectCollection", () => {
            const historyId = "234sdf342fds";
            const typeId = "dataset_collection-234234sr234";
            selectCollection(state, { historyId, typeId });
            expect(state.selectedCollection[historyId]).to.equal(typeId);
        })

    })


    // TODO: review how many of these actiually need to live in
    // the store and how many could just be computed values in
    // individual components

    describe("getters", () => {

        const firstHistoryId = testHistories[0].id;

        beforeEach(() => {
            setHistories(state, testHistories);
        })

        describe("currentHistoryId", () => {

            // if explicitly set value, return that
            // if none, return the first history
            it("should return the selected history if one is explicitly set, and is valid", () => {
                setCurrentHistoryId(state, firstHistoryId);
                const id = currentHistoryId(state);
                expect(id).to.equal(firstHistoryId);
            }),

            it("should return the first history if nothing was selected", () => {
                setCurrentHistoryId(state, null);
                const id = currentHistoryId(state);
                expect(id).to.equal(firstHistoryId);
            })

            it("should return the first history if an invalid history is selected", () => {
                setCurrentHistoryId(state, "abc");
                const id = currentHistoryId(state);
                expect(id).to.equal(firstHistoryId);
            })

            it("should return the first history if the previously selected history is deleted", () => {

                // pick 2nd history id from test data
                // check that it's in there
                const testId = state.histories[1].id;
                setCurrentHistoryId(state, testId);
                expect(currentHistoryId(state)).to.equal(testId);

                // set new history list, excluding the test history
                const newHistories = state.histories.filter(h => h.id != testId);
                setHistories(state, newHistories);
                expect(state.histories.length).to.equal(testHistories.length - 1);
                const validIds = state.histories.map(h => h.id);
                expect(validIds).to.not.include(testId);

                // get first history back
                const id = currentHistoryId(state);
                expect(id).to.equal(firstHistoryId);
            })

        })

        describe("contentSelection", () => {

            let getter;

            beforeEach(() => {
                getter = contentSelection(state);
            })

            it("should return an empty set for a valid history with no selection", () => {
                const selection = getter(firstHistoryId);
                expect(selection).to.deep.equal(new Set());
            })

            it("should return undefined for an invalid history id", () => {
                const selection = getter("floob");
                expect(selection).to.be.undefined;
            })

            it("should return the selection for an id if items have been selected", () => {

                // check we're an empty set
                const selection = getter(firstHistoryId);
                expect(selection).to.deep.equal(new Set());

                // create a fake selection
                const testSelection = ["dataset-234", "dataset-234234", "dataset_collection-234234234"];
                setContentSelection(state, {
                    historyId: firstHistoryId,
                    typeIds: testSelection
                })

                // result is a set of ids
                const newSelection = getter(firstHistoryId);
                expect(newSelection).to.deep.equal(new Set(testSelection));
            })
        }),

        describe("getSelectedCollection", () => {

            let getter;

            beforeEach(() => {
                getter = getSelectedCollection(state);
            })

            it("should retrieve undefined if nothing is selected", () => {
                const collid = getter(firstHistoryId);
                expect(collid).to.be.undefined;
            })

            it("should retrieve a value if a collection was set", () => {
                const collId = getter(firstHistoryId);
                expect(collId).to.be.undefined;

                const fakeId = "dataset_collectin-baws243asdf";
                selectCollection(state, { historyId: firstHistoryId, typeId: fakeId });

                const newCollId = getter(firstHistoryId);
                expect(newCollId).to.equal(fakeId);
            })

        })

    })

})

