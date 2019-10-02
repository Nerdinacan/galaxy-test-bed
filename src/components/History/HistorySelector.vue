<template>
    <b-dropdown text="Histories..." size="sm">
        <b-dropdown-item v-for="h in activeHistories" :key="h.id"
            :active="value == h.id"
            @click="$emit('input', h.id)">
            {{ h.name }}
        </b-dropdown-item>
    </b-dropdown>
</template>


<script>

import { sortBy } from "underscore";

export default {
    props: {
        value: { type: String, required: true }
    },
    computed: {
        activeHistories() {
            const histories = [ ...this.$store.state.history.histories ];
            const undeleted = histories.filter(h => !(h.isDeleted || h.purged));
            const sortedHistories = undeleted.sort((a,b) => {
                const aa = a.name.toLowerCase();
                const bb = b.name.toLowerCase();
                return bb - aa;
            })
            return sortedHistories;
        }
    }
}

</script>
