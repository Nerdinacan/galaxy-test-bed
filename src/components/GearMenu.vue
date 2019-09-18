<template>
    <!-- need to emit a clicked event because Bootstrap's
        popover doesn't work as advertised -->
    <div class="gear-menu" ref="menu" @click="$emit('clicked', $event)">
        <slot :go="go" :iframeGo="iframeGo"
            :backboneGo="backboneGo"
            :eventHub="eventHub"></slot>
    </div>
</template>


<script>

import { redirectToSiteUrl, backboneRedirect, iframeRedirect } from "utils/redirect";
import { eventHub } from "./eventHub";

export default {
    data() {
        return {
            eventHub
        };
    },
    methods: {
        go: redirectToSiteUrl,
        iframeGo: iframeRedirect,
        backboneGo: backboneRedirect
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
