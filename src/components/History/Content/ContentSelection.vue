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
                        <b-dropdown-item @click="hideDatasets">
                            {{ 'Hide Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="unhideDatasets">
                            {{ 'Unhide Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="deleteDatasets">
                            {{ 'Delete Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="undeleteDatasets">
                            {{ 'Undelete Datasets' | localize }}
                        </b-dropdown-item>
                        <b-dropdown-item @click="purgeDatasets">
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
            <gear-menu #default="{ go, backboneGo, iframeGo, eventHub }" @clicked="closeMenu('datasetMenu')">
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
            @ok="unhideAllHiddenContent">
            <p>{{ messages.unhideContent | localize }}</p>
        </b-modal>

        <b-modal id="delete-hidden-content"
            title="Delete Hidden Datasets" title-tag="h2"
            @ok="deleteAllHiddenContent">
            <p>{{ messages.deleteHiddenContent | localize }}</p>
        </b-modal>

        <b-modal id="purge-deleted-content"
            title="Purge Deleted Datasets" title-tag="h2"
            @ok="purgeAllDeletedContent">
            <p>{{ messages.purgeDeletedContent | localize }}</p>
        </b-modal>

        <!-- #endregion -->

    </section>
</template>


<script>

import { mapGetters, mapMutations } from "vuex";
import ContentFilters from "./ContentFilters";
import GearMenu from "components/GearMenu";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import { eventHub } from "components/eventHub";
import { SearchParams } from "../model/SearchParams";
import toggle from "components/mixins/toggle";
import messages from "../messages";

import {
    showAllHiddenContent,
    deleteAllHiddenContent,
    purgeAllDeletedContent,
    bulkContentUpdate
} from "../model/queries";

import {
    // createPromiseFromOperator,
    cacheContent
} from "../model/caching";


// temporary adapters use old backbone modals until I rewrite them
import {
    datasetListModal,
    datasetPairModal,
    listOfPairsModal,
    collectionFromRulesModal
} from "../adapters/backboneListModals";



export default {
    mixins: [ toggle, messages ],
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
            return this.currentSelection.length;
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

        // #region selection management

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

        async unhideAllHiddenContent(evt) {
            try {
                const changed = await showAllHiddenContent(this.history);
                return await this.cacheChangedContent(changed);
            } catch(err) {
                console.warn("error in showHiddenContent", err)
            } finally {
                evt.vueTarget.hide();
            }
        },

        async deleteAllHiddenContent(evt) {
            try {
                const changed = await deleteAllHiddenContent(this.history);
                return await this.cacheChangedContent(changed);
            } catch(err) {
                console.warn("error in deleteHiddenContent", err)
            } finally {
                evt.vueTarget.hide();
            }
        },

        async purgeAllDeletedContent(evt) {
            try {
                const changed = await purgeAllDeletedContent(this.history);
                return await this.cacheChangedContent(changed);
            } catch(err) {
                console.warn("error in purgeAllDeletedContent", err)
            } finally {
                evt.vueTarget.hide();
            }
        },

        // #endregion

        // #region selected content manipulation, hide/show/delete/purge

        async hideDatasets() {
            await this.updatedSelectedContent({ visible: false });
        },

        async unhideDatasets() {
            await this.updatedSelectedContent({ visible: true });
        },

        async deleteDatasets() {
            await this.updatedSelectedContent({ deleted: true });
        },

        async purgeDatasets() {
            await this.updatedSelectedContent({ purged: true, deleted: true });
        },

        async undeleteDatasets() {
            await this.updatedSelectedContent({ deleted: false });
        },

        async updatedSelectedContent(updates) {
            const items = this.selectedItemIds;
            if (!items.length) return [];
            const changed = await bulkContentUpdate(this.history, items, updates);
            const cacheResult = await this.cacheChangedContent(changed);
            this.clearSelection();
            return changed;
        },

        // #endregion

        // #region collection creation

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
            console.log("createCollection");
            const items = this.selectedItemIds;
            if (!items.length) return;
            const ajaxResult = await createDatasetCollection(this.history, selection);
            console.log("createCollection ajaxResult", ajaxResult);
            // const cacheFn = createPromiseFromOperator(cacheDatasetCollection);
            // return await cacheFn(ajaxResult);
        },

        // #endregion

        // cache list of stuff we changed
        async cacheChangedContent(changed = []) {
            if (changed.length) {
                // const cacheFn = createPromiseFromOperator(cacheContent);
                // return await Promise.all(changed.map(async c => await cacheFn(c)));
            }
            return [];
        },

        // need to do this because bootstrap's components never close as advertised
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
            eventHub.$emit("toggleShowSelection", newVal);
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
