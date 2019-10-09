/**
 * This wrapper exists because the collection API response is incompetent and inconsistent.
 * This wrapper makes the response of the dataset collection api look like the response from the
 * standard /api/history/#/contents endpoints so we can reuse the same components.
 */

import dasherize from "underscore.string/dasherize";
import { safeAssign } from "utils/safeAssign";
import { dateMethods, collectionCosmetics } from "../caching/db";
import moment from "moment";

const rawStupidData = new WeakMap();

export class DscWrapper {

    constructor(raw) {
        rawStupidData.set(this, raw);

        const safeProps = new Set([
            ...Object.keys(raw.object),
            ...Object.keys(raw)
        ])
        safeProps.delete("elements");
        safeProps.delete("_rev");
        safeProps.delete("object");
        safeProps.delete("url");

        [ ...safeProps ].forEach(prop => {
            this[prop] = null;
        })

        safeAssign(this, raw, raw.object);
    }

    get raw() {
        return rawStupidData.get(this);
    }

    get children() {
        const list = this.raw.object.elements || [];
        const result = list.map(DscWrapper.create);
        return result;
    }

    get component() {
        return dasherize(this.raw.element_type);
    }

    get title() {
        return this.name || this.raw.element_identifier;
    }

    get url() {
        const { history_id, id } = this.raw.object;
        return `/api/histories/${history_id}/contents/${id}`;
    }

    getUpdateDate() {
        return moment.utc(this.raw.object.update_time);
    }

    static create(raw) {
        return new DscWrapper(raw);
    }

}

// mixins
Object.assign(DscWrapper.prototype, dateMethods);
Object.assign(DscWrapper.prototype, collectionCosmetics);