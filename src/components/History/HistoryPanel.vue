<template>
    <div v-if="historyId" class="d-flex flex-column">

        <history v-if="!selectedCollection" :historyId="historyId">
            <template #history-top-nav>
                <history-top-nav class="pb-3" />
            </template>
        </history>

        <dsc-panel v-if="selectedCollection"
            :historyId="historyId"
            :selectedTypeId="selectedCollection" />

    </div>
</template>


<script>

import { mapGetters } from "vuex";
import History from "./History";
import HistoryTopNav from "./HistoryTopNav";
import DscPanel from "./DscPanel/Panel";

export default {
    components: {
        History,
        HistoryTopNav,
        DscPanel
    },
    props: {
        historyId: { type: String, required: true }
    },
    computed: {

        ...mapGetters("history", [
            "getSelectedCollection"
        ]),

        selectedCollection() {
            return this.getSelectedCollection(this.historyId);
        }
    }
}

</script>
