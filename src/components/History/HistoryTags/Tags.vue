<template>
    <tags v-if="history"
        :tags="history.tags"
        :storeKey="storeKey"
        :tagService="tagService" />
</template>


<script>

import { Tags } from "components/Tags";
import { HistoryTagService } from "./HistoryTagService";

export default {
    components: { Tags },
    props:{
        history: { type: Object, required: true }
    },
    computed: {
        storeKey() {
            return `History-${this.history.id}`;
        },
        tagService() {
            return new HistoryTagService(this.history);
        }
    }
}

</script>
