/**
 * Our API is very inconsistent which makes re-using components difficult.
 * This wrapper is supposed to make datasets that belong to dataset collections
 * look reasonably close to datasets that are loose in the content results so
 * we can pass them to the same components.
 */

import { Content } from "../Content";
import { Dataset } from "../Dataset";


// store reference to the raw data for later
// allows us to hold onto original bungled format
// so that we can deliver it in a sensible way without
// storing it on props in the DatasetCollection object
const rawData = new WeakMap();


export class DatasetCollection extends Content {


    constructor(raw = {}) {

        // don't put these props right onto the object
        const badProps = new Set([ "elements" ]);

        const props = Object.keys(raw).reduce((result, prop) => {
            if (!badProps.has(prop)) {
                result[prop] = raw[prop];
            }
            return result;
        }, {});

        super(props);

        // ...but store them for later
        rawData.set(this, raw);
    }


    get raw() {
        return rawData.get(this);
    }

    get children() {
        return this.raw.elements.map(o => {
            let child = null;
            switch(o.element_type) {
                case "hda":
                    child = DatasetCollection.createChildDataset(o);
                    break;
                case "dataset_collection":
                    child = DatasetCollection.createChildCollection(o);
                    break;
                default:
                    console.warn("DatasetCollection.children, Unhandled element_type");
                    break;
            }
            return child;
        }).filter(Boolean);
    }

    get collectionCount() {
        const count = this.element_count;
        if (!count) return null;
        return count == 1 ? "with 1 item" : `with ${count} items`;
    }

    get collectionType() {
        if (!this.collection_type) {
            return null;
        }
        switch(this.collection_type) {
            case "list":
                return "list"
            case "paired":
                return "dataset pair"
            case "list:paired":
                return "list of pairs";
            default:
                return "nested list";
        }
    }

    /*
    get url() {
        const { history_id, id } = this.raw.object;
        return `/api/histories/${history_id}/contents/${id}`;
    }
    getUpdateDate() {
        return moment.utc(this.raw.object.update_time);
    }
    */


    // creates child collection from bungled api tree format
    static createChildCollection(raw) {
        const allProps = Object.assign({}, raw, raw.object, {
            name: raw.element_identifier
        });
        const { object, element_identifier, ...props } = allProps; // eslint-disable-line no-unused-vars
        return new DatasetCollection(props);
    }

    // creates a child dataset from the bungled api tree format
    static createChildDataset(raw) {
        const allProps = Object.assign({}, raw, raw.object, {
            name: raw.element_identifier
        });
        const { object, element_identifier, ...props } = allProps; // eslint-disable-line no-unused-vars
        return new Dataset(props);
    }
}
