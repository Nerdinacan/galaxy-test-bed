<template>
    <div :data-state="content.populated_state"
        @mouseover="$emit('focusItem', $event)"
        @keydown.arrow-right.self.stop.prevent="drillDown"
        @keydown.arrow-up.self.stop.prevent="$emit('shiftUp', $event)"
        @keydown.arrow-down.self.stop.prevent="$emit('shiftDown', $event)"
        @keydown.space.self.stop.prevent="toggleSelection"
        @click.stop="drillDown">

        <nav class="content-top-menu d-flex justify-content-between">
            <icon-menu class="status-menu">
                <icon-menu-item v-if="showSelection"
                    :active="selected"
                    icon="check"
                    @click.stop="selected = !selected" />
            </icon-menu>

            <div class="hid flex-grow-1" v-if="content.hid">
                <span>{{ content.hid }}</span>
            </div>

            <icon-menu>
                <icon-menu-item ref="deleteButton"
                    title="Delete Collection"
                    icon="trash"
                    tooltip-placement="topleft" />
            </icon-menu>
        </nav>

        <header class="px-3 py-2" v-if="content">
            <h4><a href="#">{{ content.name }}</a></h4>
            <p class="m-0">
                a {{ content.collectionType() | localize }}
                {{ content.collectionCount() | localize }}
            </p>
        </header>

        <b-popover ref="deleteMenu"
            :target="() => $refs['deleteButton']"
            placement="bottomleft"
            triggers="click blur">

            <gear-menu #default="{ go }">
                <div @click.stop="$refs.downloadMenu.$emit('close')">
                    <a href="#" class="dropdown-item" @click="deleteCollection">
                        {{ 'Collection Only' | localize }}
                    </a>
                    <a href="#" class="dropdown-item" @click="deleteDatasets" >
                        {{ 'Delete Datasets' | localize }}
                    </a>
                    <a href="#" class="dropdown-item" @click="deletePermanently">
                        {{ 'Permanently Delete Datasets' | localize }}
                    </a>
                </div>
            </gear-menu>

        </b-popover>

    </div>
</template>


<script>

import { mapMutations } from "vuex";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import GearMenu from "components/GearMenu";


export default {
    components: {
        GearMenu,
        IconMenu,
        IconMenuItem,
    },
    props: {
        content: { type: Object, required: true },
        selected: { type: Boolean, required: false, default: false },
        showSelection: { type: Boolean, required: false, default: false }
    },
    methods: {

        ...mapMutations("history", [
            "selectCollection",
        ]),

        toggleSelection() {
            this.$emit("update:selected", !this.selected);
        },

        drillDown() {
            const { history_id: historyId, type_id: typeId } = this.content;
            this.selectCollection({ historyId, typeId });
        },

        deleteCollection() {
            console.log("deleteCollection")
        },

        deleteDatasets() {
            console.log("deleteDatsets");
        },

        deletePermanently() {
            console.log("deletePermanently");
        }
    }
}

</script>


<style lang="scss" scoped>

header, header * {
    cursor: pointer;
}

</style>
