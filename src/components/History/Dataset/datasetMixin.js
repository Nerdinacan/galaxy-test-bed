/**
 * Mixin for expanding dataset item.
 * When "expanded", loads detailed dataset value instead of just
 * the content index stuff which we use in collapsed mode.
 */

import { tap, pluck, startWith } from "rxjs/operators";
import { DatasetCache } from "../model/Dataset";
import { Content } from "../model/Content";

export default {
    props: {
        content: { type: Content, required: true }
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
