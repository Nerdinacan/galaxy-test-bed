<template>
    <nav v-if="historyId" class="history-list-menu d-flex align-items-center">

        <div class="flex-grow-1 mr-3">
            <history-selector v-model="historyId" />
        </div>

        <icon-menu class="no-border">
            <icon-menu-item title="Create New History"
                icon="plus"
                @click="createHistory"
                tooltip-placement="bottom" />
            <icon-menu-item title="View All Histories"
                icon="columns"
                @click="go('/history/view_multiple')"
                tooltip-placement="bottom" />
            <icon-menu-item id="endlessMenuGear"
                title="History Options"
                icon="cog"
                tooltip-placement="bottom" />
        </icon-menu>

        <b-popover ref="endlessMenu" target="endlessMenuGear" placement="bottomleft" triggers="click blur">
            <gear-menu>
                <div @clicked="$refs.endlessMenu.$emit('close')">
                    <a class="dropdown-item" href="#" @click="backboneGo('/histories/list')">
                        {{ 'Saved Histories' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="backboneGo('/histories/list_shared')">
                        {{ 'Histories Shared with Me' | localize }}
                    </a>
                    <a class="dropdown-item" href="#" @click="useLegacyHistoryPanel">
                        {{ 'Use legacy history panel' | localize }}
                    </a>
                </div>
            </gear-menu>
        </b-popover>

    </nav>
</template>


<script>

import { mapGetters, mapMutations } from "vuex";
import { createNewHistory } from "./model/History";

import HistorySelector from "./HistorySelector";
import GearMenu from "components/GearMenu";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import legacyNavigation from "components/mixins/legacyNavigation";

export default {
    mixins: [ legacyNavigation ],
    components: {
        HistorySelector,
        IconMenu,
        IconMenuItem,
        GearMenu
    },
    computed: {

        ...mapGetters("history", [
            "currentHistoryId"
        ]),

        historyId: {
            get() {
                return this.currentHistoryId;
            },
            set(id) {
                this.setCurrentHistoryId(id);
            }
        }
    },
    methods: {

        ...mapMutations("history", [
            "setCurrentHistoryId"
        ]),

        useLegacyHistoryPanel() {
            sessionStorage.removeItem('useBetaHistory');
            location.reload();
        },

        async createHistory() {
            const newHistory = await createNewHistory();
            this.historyId = newHistory.id;
            this.closeMenu();
        },

        closeMenu() {
            const menu = this.$refs['endlessMenu'];
            if (menu) {
                menu.$emit('close');
            }
        }
    }
}

</script>
