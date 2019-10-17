import { expect } from "chai";
import { Dataset } from "../Dataset";
import { Content } from "../Content";
import { DatasetCollection } from "./DatasetCollection";

// sample data
import dsList from "../testdata/datasetList.json";
import dsPair from "../testdata/datasetPair.json";
import nestedDsc from "../testdata/datasetCollection.json";


describe("model/DatasetCollection", () => {

    describe("dataset list", () => {

        const dsc = new DatasetCollection(dsList);

        it("is a DatasetCollection", () => {
            expect(dsc).to.be.instanceOf(DatasetCollection);
            expect(dsc).to.be.instanceOf(Content);
        })

        it("has children that are Datasets", () => {
            expect(dsc.children.length).to.equal(dsList.elements.length);
            dsc.children.forEach(child => {
                expect(child).to.be.instanceOf(Dataset);
                expect(dsc).to.be.instanceOf(Content);
            })
        })
    })

    describe("dataset pair", () => {

        const dsc = new DatasetCollection(dsPair);

        it("is a DatasetCollection", () => {
            expect(dsc).to.be.instanceOf(DatasetCollection);
            expect(dsc).to.be.instanceOf(Content);
        })

        it("pair children are Datasets", () => {
            expect(dsc.children.length).to.equal(dsPair.elements.length);
            dsc.children.forEach(child => {
                expect(child).to.be.instanceOf(Dataset);
                expect(dsc).to.be.instanceOf(Content);
            })
        })

    })


    describe("nested collection", () => {

        const dsc = new DatasetCollection(nestedDsc);

        it("is a DatasetCollection", () => {
            expect(dsc).to.be.instanceOf(DatasetCollection);
            expect(dsc).to.be.instanceOf(Content);
        })

        it("children are DatasetCollections", () => {
            expect(dsc.children.length).to.equal(nestedDsc.elements.length);
            dsc.children.forEach(child => {
                expect(child).to.be.instanceOf(DatasetCollection);
                expect(child).to.be.instanceOf(Content);
            })
        })

        it("grandchildren are Datasets", () => {
            expect(dsc.children.length).to.equal(nestedDsc.elements.length);
            dsc.children.forEach(child => {
                child.children.forEach(grandchild => {
                    expect(grandchild).to.be.instanceOf(Dataset);
                    expect(grandchild).to.be.instanceOf(Content);
                })
            })
        })
    })

})
