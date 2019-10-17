<template>
    <icon-menu>

        <icon-menu-item v-if="showErrorButton"
            title="View or report this error"
            icon="bug"
            @click.stop="reportError"
            tooltip-placement="topright" />

        <icon-menu-item v-if="showDownloads && !hasMetaData"
            title="Download"
            icon="floppy-o"
            download target="_blank"
            :href="getUrl('download')"
            tooltip-placement="topright"
            @click.stop />

        <icon-menu-item v-if="showDownloads && hasMetaData"
            ref="metafileDownloadButton"
            title="Download"
            icon="floppy-o"
            tooltip-placement="topright" />

        <b-popover v-if="showDownloads && hasMetaData"
            ref="downloadMenu"
            target="$refs['metafileDownloadButton']"
            placement="bottomleft"
            triggers="click blur">
            <gear-menu #default="{ go }">
                <div>
                    <a class="dropdown-item" download target="_blank" :href="getUrl('download')">
                        {{ 'Download Dataset' | localize }}
                    </a>
                    <a class="dropdown-item" v-for="mf in dataset.meta_files" :key="mf.download_url"
                        :href="metadataDownloadUrl(mf)">
                        {{ 'Download' | localize }} {{ mf.file_type }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>

        <!-- view details -->
        <icon-menu-item v-if="showJobParamsButton"
            title="View Details"
            icon="info-circle"
            @click.stop="displayJobParams"
            tooltip-placement="topright" />

        <icon-menu-item v-if="showRerunButton"
            title="Run this job again"
            icon="refresh"
            @click.stop="rerun"
            :href="dataset.urls.rerun"
            tooltip-placement="topright" />

        <icon-menu-item v-if="showVisualizeButton"
            id="vizButton"
            title="Visualize this data"
            icon="bar-chart"
            @click.stop="visualize"
            tooltip-placement="topright" />

        <!-- tool help -->
        <icon-menu-item v-if="showToolHelpButton"
            title="Tool Help"
            icon="question"
            @click.stop="showToolHelp = true"
            tooltip-placement="topright" />
        <tool-help-modal v-if="showToolHelpButton"
            :showToolHelp.sync="showToolHelp"
            :job-id="dataset.creating_job" />

        <!-- View Data -->
        <icon-menu-item v-if="showDisplayButton"
            :title="displayButtonTitle"
            :disabled="displayButtonDisabled"
            class="display-btn"
            icon="eye"
            @click.stop="viewData"
            tooltip-placement="topleft" />

        <!-- edit attributes -->
        <icon-menu-item v-if="showEditButton"
            :title="editButtonTitle"
            :disabled="editButtonDisabled"
            icon="pencil"
            @click.stop="editAttributes"
            tooltip-placement="topleft" />

        <!-- delete this -->
        <icon-menu-item v-if="showDeleteButton"
            :title="deleteButtonTitle"
            :disabled="isPurged"
            icon="trash"
            @click.stop="deleteMe"
            tooltip-placement="topleft" />

        <!-- remove this -->
        <icon-menu-item v-if="showUndeleteButton"
            title="Undelete"
            :disabled="isPurged"
            :active="isDeleted && !isPurged"
            icon="trash"
            @click.stop="undeleteMe"
            tooltip-placement="topleft" />

    </icon-menu>
</template>

<script>

import { mapGetters } from "vuex";
import { deleteContent, undeleteContent } from "../model/Content";
import STATES from "../model/states";
import messages from "../messages";

import legacyNavigation from "components/mixins/legacyNavigation";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import GearMenu from "components/GearMenu";
import ToolHelpModal from "../ToolHelpModal";


import { prependPath, iframeRedirect } from "utils/redirect";

function bbRoute() {
    console.warn("bbRoute");
}

function useGalaxy() {
    console.warn("useGalaxy");
}


export default {
    mixins: [ messages, legacyNavigation ],
    components: {
        IconMenu,
        IconMenuItem,
        GearMenu,
        ToolHelpModal
    },
    props: {
        content: { type: Object, required: true },
        dataset: { required: true, default: null },
        debug: { type: Boolean, required: false, default: false }
    },
    data() {
        return {
            showToolHelp: false,
            toolHelp: null
        }
    },
    computed: {

        ...mapGetters("user", ["currentUser"]),

        state() {
            return this.dataProp('state');
        },

        isPurged() {
            return this.dataProp('purged')
        },

        isDeleted() {
            return this.dataProp('isDeleted');
        },

        isDeletedOrPurged() {
            return this.isDeleted || this.isPurged;
        },

        hasData() {
            return this.dataset.file_size > 0;
        },

        downloadUrl() {
            const { id, file_ext } = this.dataset;
            return `datasets/${id}/display?to_ext=${file_ext}`;
        },


        // Display button

        showDisplayButton() {
            const badStates = new Set([ STATES.NOT_VIEWABLE, STATES.DISCARDED ]);
            const result = this.dataProp('accessible') && !badStates.has(this.state);
            return result;
        },
        displayButtonDisabled() {
            const badStates = new Set([ STATES.UPLOAD, STATES.NEW ]);
            const result = this.dataProp('purged') || badStates.has(this.state);
            return result;
        },
        displayButtonTitle() {
            if (this.dataProp('purged')) {
                return this.messages.displayPurged;
            }
            if (this.state == STATES.UPLOAD) {
                return this.messages.displayUploading;
            }
            if (this.state == STATES.NEW) {
                return this.messages.displayTooNew;
            }
            return this.messages.displayDefault;
        },


        // Edit Attributes button

        showEditButton() {
            const badStates = new Set([ STATES.NOT_VIEWABLE, STATES.DISCARDED ]);
            const result = this.dataProp('accessible') && !badStates.has(this.state);
            return result;
        },
        editButtonDisabled() {
            // disable if purged or deleted and explain why in the tooltip
            // disable if still uploading or new
            const disabledStates = new Set([ STATES.UPLOAD, STATES.NEW ]);
            const result = this.isDeletedOrPurged || disabledStates.has(this.state);
            return result;
        },
        editButtonTitle() {
            const unreadyStates = new Set([ STATES.UPLOAD, STATES.NEW ]);
            if (this.dataProp('isDeleted')) {
                return this.messages.editDeleted;
            }
            if (this.dataProp('purged')) {
                return this.messages.editPurged;
            }
            if (unreadyStates.has(this.state)) {
                return this.messages.editNotReady;
            }
            return this.messages.editDefault;
        },


        // Delete button

        showDeleteButton() {
            return this.dataProp('accessible') && !this.dataProp('isDeleted');
        },
        deleteButtonTitle() {
            return this.isDeletedOrPurged
                ? this.messages.deleteAlreadyDeleted
                : this.messages.deleteDefault;
        },


        // Undelete Button

        showUndeleteButton() {
            return this.dataProp('accessible') && this.dataProp('isDeleted');
        },


        // report error button

        showErrorButton() {
            const result = this.dataset && this.state == STATES.ERROR;
            return result;
        },


        // downloads

        showDownloads() {
            if (!this.dataset || this.dataProp('purged')) {
                return false;
            }
            if (!this.hasData) {
                return false;
            }
            const okStates = new Set([ STATES.OK, STATES.FAILED_METADATA, STATES.ERROR ]);
            return okStates.has(this.state);
        },

        hasMetaData() {
            return this.dataset && this.dataset.meta_files.length > 0;
        },


        // Params Button

        showJobParamsButton() {
            const result = this.dataset && this.state !== STATES.NOT_VIEWABLE;
            return result;
        },


        // rerun

        showRerunButton() {
            const badStates = new Set([ STATES.UPLOAD, STATES.NOT_VIEWABLE ]);
            const result = this.dataset
                && this.dataProp('rerunnable')
                && this.dataProp('creating_job')
                && !badStates.has(this.state);
            return result;
        },


        // visualize

        showVisualizeButton() {
            const goodStates = new Set([ STATES.OK, STATES.FAILED_METADATA ]);
            const result = this.dataset
                && !this.isDeletedOrPurged
                && this.dataset.viz_count > 0
                && this.hasData
                && goodStates.has(this.state);
            return result;
        },

        visualizeUrl() {
            return `/visualizations?dataset_id=${this.dataset.id}`;
        },


        // tool help button

        showToolHelpButton() {
            const result = this.dataset
                && this.dataProp('creating_job')
                && this.currentUser
                && this.currentUser.id;
            return result;
        }

    },
    methods: {

        // we have two sources of data so when looking for a value
        // we might have to check both places, giving dataset priority
        dataProp(propName) {
            if (this.dataset && (propName in this.dataset)) {
                return this.dataset[propName];
            }
            if (propName in this.content) {
                return this.content[propName];
            }
            return undefined;
        },

        // TODO: Remove this routing function when we replace with a vue router
        bbRoute,

        getUrl(urlType) {
            if (!this.dataset) return null;
            const { id, file_ext } = this.dataset;
            const urls = {
                purge: `datasets/${id}/purge_async`,
                display: `datasets/${id}/display/?preview=True`,
                edit: `datasets/edit?dataset_id=${id}`,
                download: `datasets/${id}/display?to_ext=${file_ext}`,
                report_error: `dataset/errors?id=${id}`,
                rerun: `tool_runner/rerun?id=${id}`,
                show_params: `datasets/${id}/show_params`,
                visualization: "visualization",
                meta_download: `dataset/get_metadata_file?hda_id=${id}&metadata_name=`
            };
            return (urlType in urls) ? prependPath(urls[urlType]) : null;
        },

        metadataDownloadUrl({ file_type }) {
            return this.getUrl('meta_download') + file_type;
        },


        // Button Clicks

        viewData() {
            this.addDataset(this.dataset.id);
        },

        editAttributes() {
            this.bbRoute("datasets/edit", {
                dataset_id: this.dataset.id
            });
        },

        deleteMe() {
            deleteContent(this.content);
        },

        undeleteMe() {
            undeleteContent(this.content);
        },

        reportError() {
            this.bbRoute("datasets/error", {
                dataset_id: this.dataset.id
            })
        },

        displayJobParams() {
            const url = this.getUrl('show_params');
            this.iframeGo(url);

            // useGalaxy(Galaxy => {
            //     if (!url) {
            //         console.warn("missing show_params url");
            //         return;
            //     }
            //     if (Galaxy.frame && Galaxy.frame.active) {
            //         Galaxy.frame.add({
            //             title: "Dataset details",
            //             url
            //         });
            //     } else {
            //         iframeRedirect(url);
            //     }
            // })
        },

        rerun() {
            this.bbRoute("/", {
                job_id: this.dataset.creating_job
            });
        },

        visualize() {
            useGalaxy(Galaxy => {
                const dataset_id = this.dataset.id;
                const url = prependPath(this.visualizeUrl);
                if (Galaxy.frame && Galaxy.frame.active) {
                    Galaxy.frame.add({ url, title: "Visualization" });
                } else if (Galaxy.router) {
                    Galaxy.router.push("visualizations", { dataset_id });
                    Galaxy.trigger("activate-hda", dataset_id);
                }
            })
        },

    }
}

</script>
