<template>
    <section class="history current-dataset-collection d-flex flex-column h-100">

        <header class="p-3">

            <nav class="history-list-menu d-flex align-items-center pb-3">
                <div class="flex-grow-1">
                    <b-dropdown text="Go to..." size="sm" class="mr-3" boundary="viewport">
                        <b-dropdown-item @click="close">
                            History: {{ history.name }}
                        </b-dropdown-item>
                        <b-dropdown-item v-for="option in breadCrumbOptions"
                            :key="option.key"
                            @click="breadcrumbs = option.value">
                            {{ option.text }}
                        </b-dropdown-item>
                    </b-dropdown>
                </div>
                <icon-menu class="no-border">
                    <icon-menu-item title="Download Collection"
                        icon="floppy-o"
                        tooltip-placement="topleft"
                        @click="downloadCollection" />
                    <icon-menu-item title="Edit History Tags"
                        icon="tags"
                        :active="showTags"
                        @click="toggle('showTags')"
                        tooltip-placement="topleft" />
                    <icon-menu-item title="Back One"
                        icon="arrow-up"
                        tooltip-placement="topleft"
                        @click="backUp" />
                </icon-menu>
            </nav>

            <section class="history-details" v-if="dsc">

                <click-to-edit v-model="collectionName"
                    tag-name="h3" class="history-title mt-3"
                    ref="nameInput">
                    <template #tooltip>
                        <b-tooltip placement="bottom"
                            :target="() => $refs.nameInput"
                            :title="'Click to rename collection' | localize" />
                    </template>
                </click-to-edit>

                <p class="mt-1" v-if="selectedModel">
                    a {{ selectedModel.collectionType() | localize }}
                    {{ selectedModel.collectionCount() | localize }}
                </p>

                <transition name="fade">
                    <div v-if="showTags">
                        Tags
                    </div>
                </transition>

            </section>

        </header>

        <div class="history-contents flex-grow-1">
            <transition name="fade">
                <scroller v-if="content.length" :items="content" keyProp="id">
                    <template #default="{ item, index }">
                        <component :is="item.component"
                            class="content-item mb-1"
                            :content="item"
                            :tabindex="index"
                            @mouseover.native="focusItem($event)"
                            @selectDscItem="selectDscItem" />
                    </template>
                </scroller>
            </transition>
        </div>

        <!-- <pre>{{ content }}</pre> -->

    </section>
</template>


<script>

import { mapState, mapMutations } from "vuex";
import { tap, map, pluck, filter, startWith } from "rxjs/operators";
import { updateDataset } from "../model/Dataset$";
import { DatasetCollection$ } from "../model/DatasetCollection$";

import { IconMenu, IconMenuItem } from "components/IconMenu";
import Scroller from "components/Scroller";
import ClickToEdit from "components/Form/ClickToEdit";
import DscCollection from "./DscCollection";
import DscDataset from "./DscDataset";
import toggle from "components/mixins/toggle";

export default {

    mixins: [ toggle ],

    components: {
        ClickToEdit,
        Scroller,
        IconMenu,
        IconMenuItem,
        "dataset-collection": DscCollection,
        "hda": DscDataset
    },

    props: {
        historyId: { type: String, required: true },
        selectedTypeId: { type: String, required: true }
    },

    data() {
        return {
            loading: false,
            breadcrumbs: [],
            showTags: false
        }
    },

    subscriptions() {

        const typeId$ = this.$watchAsObservable('selectedTypeId', {
            immediate: true
        }).pipe(
            pluck('newValue'),
            filter(Boolean)
        )

        return {
            dsc: DatasetCollection$(typeId$).pipe(
                startWith(null)
            )
        }
    },

    computed: {

        ...mapState("history", [ "histories" ]),

        history() {
            return this.histories.find(h => h.id == this.historyId);
        },

        selectedModel() {
            return [ this.dsc, ...this.breadcrumbs ].pop();
        },

        content() {
            return this.selectedModel ? this.selectedModel.children : [];
        },

        collectionName: {
            get() {
                const name = this.selectedModel ? this.selectedModel.title : "";
                return name;
            },
            set(name) {
                if (name !== this.selectedModel.title) {
                    console.log("collectionName", this.selectedModel, name);
                    this.updateModel({ name });
                }
            }
        },

        breadCrumbOptions() {
            const options = [];
            if (this.dsc) {
                const parents = [ this.dsc, ...this.breadcrumbs ].slice(0, -1);
                const bcOptions = parents.map((bc, i, crumbs) => ({
                    key: bc.id,
                    value: crumbs.slice(0, i),
                    text: bc.element_identifier || this.dsc.name
                }));
                options.push(...bcOptions);
            }
            return options;
        }
    },

    methods: {

        ...mapMutations("history", [
            "selectCollection"
        ]),

        async updateModel(fields) {
            this.loading = true;
            const result = await updateDataset(this.dsc, fields).toPromise();
            console.log("updateModel result", result);
            this.loading = false;
        },

        downloadCollection() {
            console.log("downloadCollection");
        },

        selectDscItem(item) {
            this.breadcrumbs = [ ...this.breadcrumbs, item ];
        },

        backUp() {
            if (this.breadcrumbs.length) {
                this.breadcrumbs = this.breadcrumbs.slice(0,-1);
            } else {
                this.close();
            }
        },

        close() {
            this.selectCollection({
                history_id: this.historyId
            });
        },

        focusItem({ currentTarget }) {
            currentTarget.focus();
        }
    }
}

</script>


<style lang="scss">
@import "scss/transitions.scss";
</style>
