import { dateMixin, commonProps, ModelBase } from "../model";


export class Content extends dateMixin(commonProps(ModelBase)) {

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
