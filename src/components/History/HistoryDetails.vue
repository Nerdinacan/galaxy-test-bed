<template>
    <section>

        <!-- top menu -->
        <header class="d-flex justify-content-between">
            <h6>{{ niceSize | localize }}</h6>
            <slot name="menu">
                <icon-menu class="no-border" #default="{ backboneGo, iframeGo }">
                    <icon-menu-item title="Edit History Tags"
                        icon="tags"
                        :active="showTags"
                        @click="toggle('showTags')"
                        tooltip-placement="topleft" />
                    <icon-menu-item title="Copy History"
                        icon="copy"
                        :active="showTags"
                        @click="openCopyModal"
                        tooltip-placement="topleft" />
                    <icon-menu-item id="sharingMenuIcon"
                        title="Permissions"
                        icon="handshake-o"
                        tooltip-placement="topleft" />
                    <icon-menu-item id="historyDownloadMenu"
                        title="Downloads"
                        icon="download"
                        tooltip-placement="topleft" />
                    <icon-menu-item id="historyDeleteMenu"
                        title="Delete"
                        icon="trash"
                        tooltip-placement="topleft" />
                    <icon-menu-item id="historyOperationsIcon"
                        title="Current History Operations"
                        icon="cog"
                        tooltip-placement="topleft" />
                </icon-menu>
            </slot>
        </header>

        <!-- title -->
        <click-to-edit v-model="historyName"
            tag-name="h3" class="history-title mt-2"
            ref="historyNameInput">
            <template v-slot:tooltip>
                <b-tooltip placement="left"
                    :target="() => $refs.historyNameInput"
                    :title="'Click to rename history' | localize" />
            </template>
        </click-to-edit>

        <!-- description -->
        <annotation class="history-annotation mt-1"
            v-model="annotation" />

        <!-- tags -->
        <transition name="shutterfade">
            <history-tags v-if="showTags" class="history-tags" :history="history" />
        </transition>

        <!-- #region menus and modals -->

        <b-popover ref="downloadMenu" target="historyDownloadMenu" placement="bottomleft" triggers="click blur">
            <gear-menu #default>
                <div @click="$refs.downloadMenu.$emit('close')">
                    <a class="dropdown-item" href="#" @click="backboneGo('/histories/citations')">
                        {{ 'Export Tool Citations' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="iframeGo('/history/export_archive?preview=True')">
                        {{ 'Export History to File' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>

        <b-popover ref="deleteMenu" target="historyDeleteMenu" placement="bottomleft" triggers="click blur">
            <gear-menu #default>
                <div @click="$refs.deleteMenu.$emit('close')">
                    <a class="dropdown-item" href="#" v-b-modal.delete-history-modal>
                        {{ 'Delete' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" v-b-modal.purge-history-modal>
                        {{ 'Delete Permanently' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>

        <b-popover ref="sharingMenu" target="sharingMenuIcon" placement="bottomleft" triggers="click blur">
            <gear-menu #default>
                <div @click="$refs.sharingMenu.$emit('close')">
                    <a class="dropdown-item" href="#" @click="backboneGo('/histories/sharing?id=' + history.id)">
                        {{ 'Share or Publish' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" v-b-modal.make-private-modal>
                        {{ 'Make Data Private' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>

        <b-popover ref="historyOperations" target="historyOperationsIcon" placement="bottomleft" triggers="click blur">
            <gear-menu #default>
                <div @clicked="$refs.historyOperations.$emit('close')">
                    <a class="dropdown-item" href="#" @click="backboneGo('/histories/show_structure')">
                        {{ 'Show Structure' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="iframeGo('/workflow/build_from_current_history')">
                        {{ 'Extract Workflow' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>

        <copy-modal v-model="showCopyModal" :history="history" />

        <b-modal id="delete-history-modal" title="Delete History?"
            title-tag="h2" @ok="deleteHistoryClick">
            <p>{{ messages.deleteHistoryPrompt | localize }}</p>
        </b-modal>

        <b-modal id="purge-history-modal" title="Permanently Delete History?"
            title-tag="h2" @ok="purgeHistory">
            <p>{{ messages.purgeHistoryPrompt | localize }}</p>
        </b-modal>

        <b-modal id="make-private-modal" title="Make History Private"
            title-tag="h2" @ok="makePrivate">
            <p>{{ messages.makePrivatePrompt | localize }}</p>
        </b-modal>

        <!-- #endregion -->

    </section>
</template>


<script>

import HistoryTags from "./HistoryTags/Tags";
import CopyModal from "./CopyModal";
import ClickToEdit from "components/Form/ClickToEdit";
import GearMenu from "components/GearMenu";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import Annotation from "components/Form/Annotation";
import toggle from "components/mixins/toggle";
import legacyNavigation from "components/mixins/legacyNavigation";
import messages from "./messages";

import { bytesToString } from "utils/utils"

import {
    deleteHistory,
    makeHistoryPrivate,
    updateHistoryFields
} from "./model/History";


export default {

    mixins: [ toggle, messages, legacyNavigation ],

    components: {
        HistoryTags,
        IconMenu,
        IconMenuItem,
        CopyModal,
        GearMenu,
        Annotation,
        ClickToEdit
    },

    props: {
        history: { type: Object, required: true }
    },

    data() {
        return {
            showTags: false,
            showCopyModal: false,
            editAnnotation: false
        }
    },

    computed: {

        annotation: {
            get() {
                return this.history.annotation || "";
            },
            set(annotation) {
                if (annotation.length && annotation !== this.history.annotation) {
                    this.updateFields({ annotation });
                }
            }
        },

        historyName: {
            get() {
                return this.history.name;
            },
            set(name) {
                if (name.length && name !== this.history.name) {
                    this.updateFields({ name });
                }
            }
        },

        niceSize() {
            const size = this.history.size;
            return size ? bytesToString(size, true, 2) : "(empty)";
        }

    },

    methods: {

        openCopyModal() {
            this.showCopyModal = true;
        },

        async updateFields(fields = {}) {
            try {
                const result = await updateHistoryFields(this.history, fields);
                return result;
            } catch(err) {
                console.warn("Error updating history fields", this.history, fields);
            }
        },


        // TODO: fix endless looping when delete or purge
        // Vue trying to show history that we just wiped?

        async deleteHistoryClick(evt) {
            try {
                await deleteHistory(this.history);
                evt.vueTarget.hide();
            } catch(err) {
                console.warn("Failed to delete current history", err)
            }
        },

        async purgeHistory(evt) {
            try {
                await deleteHistory(this.history, true);
                evt.vueTarget.hide();
            } catch(err) {
                console.warn("Failed to purge current history", err)
            }
        },

        async makePrivate(evt) {
            try {
                await makeHistoryPrivate(this.history);
                evt.vueTarget.hide();
            } catch(err) {
                console.warn("Failed to make history private.", err)
            }
        }

    }
}

</script>


<style lang="scss">
@import "scss/transitions.scss";
</style>
