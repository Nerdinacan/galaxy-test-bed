<template>
    <section>

        <header>
            <h6>
                <span>Contents</span>
                <a href="#" @click="toggle('showFilter')">
                    <span>{{ history.hid_counter }}</span>
                </a>
            </h6>
            <icon-menu class="no-border">
                <icon-menu-item title="Filter History Content"
                    icon="filter"
                    @click="toggle('showFilter')"
                    :active="showFilter"
                    tooltip-placement="topleft" />
                <icon-menu-item title="Operations on multiple datasets"
                    icon="check-square-o"
                    @click="toggle('showSelection')"
                    :active="showSelection"
                    tooltip-placement="topleft" />
                <icon-menu-item id="datasetMenuGear"
                    title="Dataset Operations"
                    icon="cog"
                    :useTooltip="false" />
            </icon-menu>
        </header>

        <transition name="shutterfade">
            <content-filters v-if="showFilter"
                class="content-filters mt-1"
                :params.sync="localParams"
                :history="history" />
        </transition>

        <transition name="shutterfade">
            <b-button-toolbar v-if="showSelection" class="content-selection justify-content-between mt-1">
                <b-button-group>
                    <b-button size="sm" @click="selectAllVisibleContent">
                        {{ 'Select All' | localize }}
                    </b-button>
                    <b-button size="sm" @click="clearSelection">
                        {{ 'Unselect All' | localize }}
                    </b-button>
                    <b-dropdown size="sm" text="With Selected"
                        :disabled="!hasSelection" boundary="viewport">
                        <b-dropdown-item @click="hideSelected">
                            {{ 'Hide Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="unhideSelected">
                            {{ 'Unhide Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="deleteSelected">
                            {{ 'Delete Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="undeleteSelected">
                            {{ 'Undelete Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="purgeSelected">
                            {{ 'Permanently Delete Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="buildDatasetList">
                            {{ 'Build Dataset List' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="buildDatasetPair">
                            {{ 'Build Dataset Pair' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="buildListOfPairs">
                            {{ 'Build List of Dataset Pairs' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="buildCollectionFromRules">
                            {{ 'Build Collection from Rules' | localize }}
                        </b-dropdown-item>
                    </b-dropdown>
                </b-button-group>
            </b-button-toolbar>
        </transition>

        <!-- #region Menus and popovers -->

        <b-popover ref="datasetMenu" target="datasetMenuGear"
            placement="bottomleft" triggers="click blur">
            <gear-menu #default @clicked="closeMenu('datasetMenu')">
                <div>
                    <a class="dropdown-item" @click="iframeGo('/dataset/copy_datasets')">
                        {{ 'Copy Datasets' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="backboneGo('/histories/permissions?id=' + history.id)">
                        {{ 'Dataset Security' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="iframeGo('/history/resume_paused_jobs?current=True')">
                        {{ 'Resume Paused Jobs' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="eventHub.$emit('collapseAllContent')">
                        {{ 'Collapse Expanded Datasets' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" v-b-modal.show-hidden-content>
                        {{ 'Unhide Hidden Datasets' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" v-b-modal.delete-hidden-content>
                        {{ 'Delete Hidden Datasets' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" v-b-modal.purge-deleted-content>
                        {{ 'Purge Deleted Datasets' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>

        <b-modal id="show-hidden-content"
            title="Show Hidden Datasets" title-tag="h2"
            @ok="unhideAll">
            <p>{{ messages.unhideContent | localize }}</p>
        </b-modal>

        <b-modal id="delete-hidden-content"
            title="Delete Hidden Datasets" title-tag="h2"
            @ok="deleteAllHidden">
            <p>{{ messages.deleteHiddenContent | localize }}</p>
        </b-modal>

        <b-modal id="purge-deleted-content"
            title="Purge Deleted Datasets" title-tag="h2"
            @ok="purgeAllDeleted">
            <p>{{ messages.purgeDeletedContent | localize }}</p>
        </b-modal>

        <!-- #endregion -->

    </section>
</template>


<script>

import { mapGetters, mapMutations } from "vuex";
import { eventHub } from "components/eventHub";
import { SearchParams } from "../model/SearchParams";
import legacyNavigation from "components/mixins/legacyNavigation";
import toggle from "components/mixins/toggle";
import messages from "../messages";

import ContentFilters from "./ContentFilters";
import GearMenu from "components/GearMenu";
import { IconMenu, IconMenuItem } from "components/IconMenu";

import {
    hideSelectedContent,
    unhideSelectedContent,
    deleteSelectedContent,
    undeleteSelectedContent,
    purgeSelectedContent,
    unhideAllHiddenContent,
    deleteAllHiddenContent,
    purgeAllDeletedContent
} from "../model/Dataset";

// temporary adapters use old backbone modals until I rewrite them
import {
    datasetListModal,
    datasetPairModal,
    listOfPairsModal,
    collectionFromRulesModal
} from "../adapters/backboneListModals";



export default {
    mixins: [ toggle, messages, legacyNavigation ],
    components: {
        ContentFilters,
        IconMenu,
        IconMenuItem,
        GearMenu
    },
    props: {
        history: { type: Object, required: true },
        params: { type: SearchParams, required: true },
        content: { type: Array, required: false, default: () => [] }
    },
    data() {
        return {
            eventHub,
            showSelection: false,
            showFilter: false
        }
    },
    computed: {

        // pass-through
        localParams: {
            get() {
                return this.params;
            },
            set(newParams) {
                this.$emit("update:params", newParams);
            }
        },

        ...mapGetters("history", [
            "contentSelection"
        ]),

        currentSelection() {
            return this.contentSelection(this.history.id);
        },

        hasSelection() {
            return this.currentSelection.size > 0;
        },

        // returns content objects associated with selection
        selectedContent() {
            return this.content.filter(c => this.currentSelection.has(c.type_id))
        },

        // selected content in dumb format for the api
        selectedItemIds() {
            const items = Array.from(this.currentSelection).map(typeId => {
                const [ history_content_type, id ] = typeId.split("-");
                return { id, history_content_type };
            })
            return items;
        },

        // reliable?
        countHidden() {
            return this.history.contents_active.hidden;
        }
    },
    methods: {

        ...mapMutations("history", [
            "setContentSelection"
        ]),

        // #region Selection Management

        selectContent(content) {
            this.setContentSelection({
                historyId: this.history.id,
                typeIds: content.map(c => c.type_id)
            })
        },

        clearContentSelection() {
            this.selectContent([]);
        },

        selectAllVisibleContent() {
            this.selectContent(this.content)
        },

        clearSelection() {
            this.clearContentSelection({ history: this.history });
        },

        // #endregion

        // #region history-wide bulk updates, does server query first to determine "selection"

        async unhideAll(evt) {
            unhideAllHiddenContent(this.history);
            evt.vueTarget.hide();
        },

        async deleteAllHidden(evt) {
            deleteAllHiddenContent(this.history);
            evt.vueTarget.hide();
        },

        async purgeAllDeleted(evt) {
            purgeAllDeletedContent(this.history);
            evt.vueTarget.hide();
        },

        // #endregion

        // #region Selected content manipulation, hide/show/delete/purge

        async runOnSelection(fn) {
            await fn(this.history, this.selectedContent);
            this.clearSelection();
        },

        hideSelected() {
            this.runOnSelection(hideSelectedContent);
        },

        unhideSelected() {
            this.runOnSelection(unhideSelectedContent);
        },

        deleteSelected() {
            this.runOnSelection(deleteSelectedContent);
        },

        undeleteSelected() {
            this.runOnSelection(undeleteSelectedContent);
        },

        purgeSelected() {
            this.runOnSelection(purgeSelectedContent);
        },

        // #endregion

        // #region Collection Creation

        async buildDatasetList() {
            const modalSelection = await datasetListModal(this.selectedContent);
            const result = await this.createCollection({
                history: this.history,
                selection: modalSelection
            })
        },

        async buildDatasetPair() {
            const modalSelection = await datasetPairModal(this.selectedContent)
            const result = await this.createCollection({
                history: this.history,
                selection: modalSelection
            })
        },

        async buildListOfPairs() {
            const modalSelection = await listOfPairsModal(this.selectedContent)
            const result = await this.createCollection({
                history: this.history,
                selection: modalSelection
            })
        },

        async buildCollectionFromRules() {
            const modalSelection = await collectionFromRulesModal(this.selectedContent)
            const result = await this.createCollection({
                history: this.history,
                selection: modalSelection
            })
        },

        async createCollection() {
            const items = this.selectedItemIds;
            if (!items.length) return;
            const ajaxResult = await createDatasetCollection(this.history, selection);
            // const cacheFn = createPromiseFromOperator(cacheDatasetCollection);
            // return await cacheFn(ajaxResult);
        },

        // #endregion

        closeMenu(refName) {
            if (refName in this.$refs) {
                this.$refs[refName].$emit("close");
            }
        }

    },
    watch: {
        showSelection(newVal, oldVal) {
            if (!newVal) {
                this.clearSelection();
            }
            this.eventHub.$emit("toggleShowSelection", newVal);
        }
    }
}

</script>


<style lang="scss" scoped>

@import "scss/mixins.scss";
@import "scss/transitions.scss";

section > header {
    @include flexRowHeader();
}

</style>
