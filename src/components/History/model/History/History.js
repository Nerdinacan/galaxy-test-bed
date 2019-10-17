import { ModelBase } from "../model";
import { bytesToString } from "utils/utils"


export class History extends ModelBase {

    get niceSize() {
        return this.size ? bytesToString(this.size, true, 2) : "(empty)";
    }

}