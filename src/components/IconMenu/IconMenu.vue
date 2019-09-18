<template>
    <nav><slot :go="go" :iframeGo="iframeGo" :backboneGo="backboneGo" ></slot></nav>
</template>

<script>

import { redirectToSiteUrl, backboneRedirect, iframeRedirect } from "utils/redirect";

export default {
    methods: {
        go: redirectToSiteUrl,
        iframeGo: iframeRedirect,
        backboneGo: backboneRedirect
    }
}

</script>

<style lang="scss" scoped>

nav {
    display: flex;
    justify-content: space-between;
}

nav.no-border /deep/ .fa.icon-btn {
    background: transparent;
    border: none;
}

</style>


