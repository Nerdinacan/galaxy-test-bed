/**
 * Mixin for expanding dataset item.
 * When "expanded", compares local dataset data to local content data and
 * decides whether an ajax update is required.
 */

import { pluck, startWith } from "rxjs/operators";
import { Dataset$ } from "../model/Dataset$";

export default {
    props: {
        content: { type: Object, required: true }
    },
    data() {
        return {
            expand: false,
            dataset: null
        }
    },
    computed: {
        expanded() {
            return this.dataset && this.expand;
        }
    },
    methods: {

        load() {
            if (!this.datasetSub) {

                const content$ = this.$watchAsObservable('content').pipe(
                    pluck('newValue'),
                    startWith(this.content)
                );

                this.datasetSub = this.$subscribeTo(
                    Dataset$(content$),
                    ds => {
                        this.dataset = ds;
                    },
                    err => {
                        console.warn("datasetSub err", err);
                    },
                    () => {
                        this.dataset = null;
                    }
                )
            }
        },

        unload() {
            if (this.datasetSub) {
                this.datasetSub.unsubscribe();
                this.datasetSub = null;
            }
        },

        open() {
            this.expand = true;
            this.load();
        },

        collapse() {
            this.expand = false;
        },

        toggleExpand() {
            this.expand = !this.expand;
        }
    },
    watch: {
        expand(newVal) {
            if (newVal) {
                this.load();
            }
        }
    }
}
