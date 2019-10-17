<template>
    <div :class="{ expanded, collapsed: !expanded }"
        :data-state="content.state"
        @mouseover="$emit('focusItem', $event)"
        @keydown.arrow-left.self.stop.prevent="collapse"
        @keydown.arrow-right.self.stop.prevent="open"
        @keydown.arrow-up.self.stop.prevent="$emit('shiftUp', $event)"
        @keydown.arrow-down.self.stop.prevent="$emit('shiftDown', $event)"
        @keydown.space.self.stop.prevent="toggleSelection">

        <nav class="content-top-menu d-flex justify-content-between p-1"
            @click="toggleExpand">

            <icon-menu class="status-menu">
                <icon-menu-item v-if="showSelection"
                    icon="check"
                    :active="selected"
                    @click.stop="toggleSelection" />
                <icon-menu-item
                    :icon="expanded ? 'chevron-up' : 'chevron-down'"
                    :active="expanded"
                    @click.stop="toggleExpand" />
            </icon-menu>

            <div class="hid flex-grow-1 d-flex">
                <span class="mx-1">{{ content.hid }}</span>
                <span>{{ content.state }}</span>
            </div>

            <dataset-menu :content="content" :dataset="dataset" />
        </nav>

        <header v-if="!expanded" class="px-3 py-2" >
            <h4><a href="#" @click.stop="toggleExpand">{{ title }}</a></h4>
            <nametags v-if="content.tags" :tags="content.tags"
                :storeKey="tagStoreName" />
        </header>

        <header v-if="expanded" class="px-3 py-2" @mouseover.stop>
            <click-to-edit v-if="datasetName" tagName="h4" v-model="datasetName"
                :displayLabel="title"
                :tooltip-title="'Click to edit dataset name' | localize"
                tooltip-position="top" />
            <annotation class="mt-1" v-model="annotation" />
            <content-tags :content="content" />
        </header>

        <div v-if="expanded" class="details px-3 pb-3">
            <dataset-summary :dataset="dataset" />
            <dataset-applications :dataset="dataset" />
            <pre v-if="dataset.peek" class="dataset-peek" v-html="dataset.peek"></pre>
        </div>

    </div>
</template>


<script>

import { eventHub } from "components/eventHub";
import { updateContent } from "../model/Content";
import datasetMixin from "./datasetMixin";

import { IconMenu, IconMenuItem } from "components/IconMenu";
import ClickToEdit from "components/Form/ClickToEdit";
import Annotation from "components/Form/Annotation";
import DatasetApplications from "./DatasetApplications";
import DatasetMenu from "./DatasetMenu";
import DatasetSummary from "./Summary";
import ContentTags from "../Content/ContentTags";
import { Nametags } from "components/Nametags";


export default {
    mixins: [ datasetMixin ],
    components: {
        IconMenu,
        IconMenuItem,
        ClickToEdit,
        Annotation,
        DatasetApplications,
        DatasetMenu,
        DatasetSummary,
        ContentTags,
        Nametags
    },
    props: {
        selected: { type: Boolean, required: false, default: false },
        showSelection: { type: Boolean, required: false, default: false }
    },
    data() {
        return {
            loading: false,
            showTags: false,
            showToolHelp: false,
            showRaw: false,
            toolHelp: null
        }
    },
    computed: {

        tagStoreName() {
            return `Dataset-${this.content.id}`;
        },

        datasetName: {
            get() {
                return this.dataset ? this.dataset.name : "";
            },
            set(name) {
                if (name !== this.dataset.name) {
                    this.updateModel({ name });
                }
            }
        },

        annotation: {
            get() {
                return this.dataset ? this.dataset.annotation : "";
            },
            set(annotation) {
                if (annotation !== this.dataset.annotation) {
                    this.updateModel({ annotation });
                }
            }
        },

        title() {
            return this.content.title;
        }

    },
    methods: {

        async updateModel(fields) {
            this.loading = true;
            await updateContent(this.dataset, fields);
            this.loading = false;
        },

        toggleSelection() {
            this.$emit("update:selected", !this.selected);
        }

    },
    created() {
        eventHub.$on('collapseAllContent', this.collapse);
    },
    beforeDestroy() {
        eventHub.$off('collapseAllContent', this.collapse);
    }
}

</script>


<style lang="scss" scoped>

@import "theme/blue.scss";
@import "scss/mixins.scss";


/* enlarge input to match h4 */

header /deep/ .clickToEdit input {
    font-size: $h4-font-size;
    font-weight: 500;
}


/* there's a quirk in flexbox containers, we need the strange
min-width setting to make the peek overflow properly */

.dataset {
    min-width: 0;
    border-style: none;
    border-width: 0;
    .details .dataset-peek {
        width: auto;
        max-width: 100%;
        margin-bottom: 0;
        display: inline-block;
    }
}

</style>
