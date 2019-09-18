import moment from "moment";
import hash from "object-hash";

export default class DateStore {

    constructor(keyPrefix = "last-request", storage = sessionStorage) {
        this.keyPrefix = keyPrefix;
        this.storage = storage;
    }

    getKey(url) {
        return `${this.keyPrefix}-${hash(url)}`
    }

    getItem(url) {
        const key = this.getKey(url);
        return this.storage.getItem(key);
    }

    setItem(url, val) {
        const key = this.getKey(url);
        const strDate = val || moment.utc().format();
        this.storage.setItem(key, strDate);
    }

}
