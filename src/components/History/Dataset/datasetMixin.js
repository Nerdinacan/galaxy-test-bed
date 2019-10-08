/**
 * Mixin for expanding dataset item.
 * When "expanded", compares local dataset data to local content data and
 * decides whether an ajax update is required.
 */

import { pluck, startWith } from "rxjs/operators";
import { DatasetCache } from "../model/Dataset";

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

                const ds$ = this.$watchAsObservable('content').pipe(
                    pluck('newValue'),
                    startWith(this.content),
                    DatasetCache()
                )

                this.datasetSub = ds$.subscribe({
                    next: ds => this.dataset = ds,
                    error: err => console.warn("datasetSub err", err),
                    complete: () => console.log("complete should not fire")
                })
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
