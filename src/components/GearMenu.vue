<template>
    <div class="gear-menu" ref="menu" @click="$emit('clicked', $event)">
        <slot :eventHub="eventHub"></slot>
    </div>
</template>


<script>

import legacyNavigation from "components/mixins/legacyNavigation";
import { eventHub } from "./eventHub";

export default {
    mixins: [ legacyNavigation ],
    data() {
        return {
            eventHub
        }
    }
}

</script>


<style lang="css" scoped>

.gear-menu .popover-header {
    display: none;
}

.gear-menu .popover-body {
    padding-left: 0;
    padding-right: 0;
}

</style>
