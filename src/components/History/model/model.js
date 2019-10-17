/**
 * Presentation models utilities. This is what we feed the components
 * and the crud functions, etc. Goal is to separate persistence
 * and caching from API so it's easier to tweak.
 */

import { isRxDocument } from "rxdb";
import moment from "moment";


export class ModelBase {

    constructor(doc) {
        const props = isRxDocument(doc) ? doc.toJSON() : doc;
        this.loadProps(props);
    }

    loadProps(raw) {
        const { _rev, ...props } = raw; // eslint-disable-line no-unused-vars
        Object.assign(this, props);
    }
}


/**
 * Mixins
 */

export const dateMixin = superclass => class extends superclass {

    // converts barbaric string date to a moment object
    get updateDate() {
        return moment.utc(this.update_time);
    }
}

export const commonProps = superclass => class extends superclass {

    get isDeletedOrPurged() {
        return this.isDeleted || this.purged;
    }

    get title() {
        const { name, isDeleted, visible, purged } = this;

        let result = name;

        const itemStates = [];

        if (isDeleted) {
            itemStates.push("Deleted");
        }
        if (visible == false) {
            itemStates.push("Hidden");
        }
        if (purged) {
            itemStates.push("Purged");
        }
        if (itemStates.length) {
            result += ` (${itemStates.join(", ")})`;
        }

        return result;
    }
}
