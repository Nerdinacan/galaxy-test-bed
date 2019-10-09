<template>
    <nav><slot :go="go" :iframeGo="iframeGo" :backboneGo="backboneGo" ></slot></nav>
</template>

<script>

import legacyNavigation from "components/mixins/legacyNavigation";

export default {
    mixins: [ legacyNavigation ]
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


