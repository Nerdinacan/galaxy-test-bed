<template>
    <b-input-group v-if="params">

        <debounced-input v-model.trim="filterText">
            <b-form-input slot-scope="scope" size="sm"
                :value="scope.value"
                @input="scope.input"
                :placeholder="'Search Filter' | localize" />
        </debounced-input>

        <b-input-group-append>
            <b-button size="sm" v-if="history.contents_active.deleted"
                :variant="params.showDeleted ? 'info' : 'secondary'"
                @click="toggleDeleted">
                {{ 'Deleted' | localize }}
            </b-button>
            <b-button size="sm" v-if="history.contents_active.hidden"
                :variant="params.showHidden ? 'info' : 'secondary'"
                @click="toggleHidden">
                {{ 'Hidden' | localize }}
            </b-button>
        </b-input-group-append>

    </b-input-group>
</template>


<script>

import { SearchParams } from "../model/SearchParams";
import DebouncedInput from "components/Form/DebouncedInput";

export default {
    components: {
        DebouncedInput
    },
    props: {
        history: { type: Object, required: true },
        params: { type: SearchParams, required: true }
    },
    computed: {
        filterText: {
            get() {
                return this.params.filterText;
            },
            set(newVal) {
                const params = this.params.clone();
                params.filterText = newVal;
                this.updateParams(params);
            }
        }
    },
    methods: {
        toggleDeleted() {
            const params = this.params.clone();
            params.showDeleted = !params.showDeleted
            this.updateParams(params);
        },
        toggleHidden() {
            const params = this.params.clone();
            params.showHidden = !params.showHidden
            this.updateParams(params);
        },
        updateParams(params) {
            // remove limits when filters change
            const newParams = params.resetExtrema()
            this.$emit('update:params', newParams);
        }
    }
}

</script>
