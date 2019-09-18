<template>
    <tags :tags="dataset.tags"
        :storeKey="tagStoreName"
        :tagService="tagService"
        :disabled="disabled"
        :useToggleLink="true" />
</template>

<script>

import { Tags } from "components/Tags";
import { DatasetTagService } from "./DatasetTagService";

export default {
    components: {
        Tags
    },
    props: {
        dataset: { type: Object, required: true },
        historyId: { type: String, required: true },
        disabled: { type: Boolean, required: false, default: false }
    },
    computed: {
        tagStoreName() {
            return `Dataset-${this.dataset.id}`;
        },
        tagService() {
            return this.dataset ? new DatasetTagService(this.dataset, this.historyId) : null;
        }
    }
}

</script>