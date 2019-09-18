
export class SearchParams {

    constructor(props = {}) {

        this.historyId = null;

        // filters
        this._filterText = "";
        this._showDeleted = false;
        this._showHidden = false;

        // skip/limit
        this.skip = 0;
        this.limit = SearchParams.pageSize;

        Object.assign(this, props);
    }


    // Setting filters resets the limits

    get filterText() {
        return this._filterText;
    }

    set filterText(newVal) {
        this.resetExtrema();
        this._filterText = newVal;
    }

    get showDeleted() {
        return this._showDeleted;
    }

    set showDeleted(val) {
        this.resetExtrema();
        this._showDeleted = val;
    }

    get showHidden() {
        return this._showHidden;
    }

    set showHidden(val) {
        this.resetExtrema();
        this._showHidden = val;
    }

    clone() {
        return new SearchParams(this);
    }

    // remove extrema
    resetExtrema() {
        const newParams = this.clone();
        newParams.skip = 0;
        newParams.limit = SearchParams.pageSize;
        // newParams.report("resetExtrema");
        return newParams;
    }

    chunk(size = SearchParams.pageSize) {
        const newParams = this.clone();
        newParams.limit = size;
        // newParams.report("chunk");
        return newParams;
    }

    nextPage(size = SearchParams.pageSize) {
        const newParams = this.clone();
        newParams.skip = newParams.skip + size;
        // newParams.report("nextPage");
        return newParams;
    }

    // extends limit on content query down for scrolling on UI
    extendLimit(pages = 1) {
        const newParams = this.clone();
        newParams.limit = newParams.limit + (pages * SearchParams.pageSize);
        // newParams.report("extendLimit");
        return newParams;
    }

    // debugging
    report(label = "params") {
        const { skip, limit, showDeleted, showHidden, filterText, historyId } = this;
        console.groupCollapsed(label, `(${skip},${limit})`);
        console.log("historyId", historyId);
        console.log("showDeleted", showDeleted);
        console.log("showHidden", showHidden);
        console.log("filterText", filterText);
        console.log("skip", skip);
        console.log("limit", limit);
        console.groupEnd();
    }

    toString(){
        // return `Params: ${this.end} -> ${this.start}, (${this.skip},${this.limit})`;
        return `Params: (${this.skip},${this.limit})`;
    }

    static equals(a, b) {
        return JSON.stringify(a) == JSON.stringify(b);
    }

    // equivalence test ignoring skip/limit
    static filtersEqual(a, b) {
        const aa = a.clone().resetExtrema();
        const bb = b.clone().resetExtrema();
        return SearchParams.equals(aa, bb);
    }

    // creates a new params for a history
    static createForHistory(history) {
        return new SearchParams({
            historyId: history.id
        });
    }

}


// size of requests from server
SearchParams.pageSize = 25;
