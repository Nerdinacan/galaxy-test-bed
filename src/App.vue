<template>
    <history-panel v-if="currentHistoryId"
        class="history-panel"
        :historyId="currentHistoryId" />
</template>

<script>

import { mapGetters } from "vuex";
import { HistoryPanel } from "./components/History";

export default {
    name: 'app',
    components: {
        HistoryPanel
    },
    computed: {
        ...mapGetters("history", [
            "currentHistoryId",
            // "currentCollection"
        ])
    }
}

</script>

<style lang="scss">
@import "scss/mixins";
.history-panel {
    @include absfill();
}
</style>
