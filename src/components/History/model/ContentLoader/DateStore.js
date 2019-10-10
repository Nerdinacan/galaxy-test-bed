/**
 * This is required until such time as our API works properly.
 * It keeps track of the last time a particular request was made
 * so that we can filter future requests
 */

import moment from "moment";

export const DateStore = (storage = new Map()) => ({
    getItem: key => {
        return storage.has(key) ? storage.get(key) : null;
    },
    setItem: (key, val) => {
        const strDate = val || moment.utc().format();
        storage.set(key, strDate);
    }
})
