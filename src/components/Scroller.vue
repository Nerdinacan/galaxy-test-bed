<template>
    <div class="scrollContainer" :class="{ loading }">
        <ol class="scrollContent">
            <li v-for="(item, index) in items" :key="item[keyProp]">
                <div class="sensor" v-if="showSensor(index)" v-observe-visibility="{
                    callback: (isVisible, entry) => onSensorVisible(isVisible, entry, item, index),
                    once: true
                }"></div>
                <slot :item="item" :index="index">
                    {{ item }}
                </slot>
            </li>
        </ol>
    </div>
</template>


<script>

// TODO: this component has been vastly simplified in the interest of getting the
// rest of the history component published. Come back and re-implement
// virtual scrolling through for huge datasets

import { ObserveVisibility } from "vue-observe-visibility";

export default {
    directives: {
        ObserveVisibility
    },
    props: {
        items: { type: Array, required: false, default: () => [] },
        keyProp: { type: String, required: true },
        loading: { type: Boolean, required: false, default: false },
        buffer: { type: Number, required: false, default: 10 }
    },
    methods: {

        // set at the end, or if we have enough items, move it up a little
        // to query a little earlier
        showSensor(index) {
            let targetIndex = this.items.length - 1;
            if (this.items.length > this.buffer) {
                targetIndex = this.items.length - this.buffer;
            }
            return (targetIndex > 0) ? index == targetIndex : false;
        },

        onSensorVisible(isVisible, entry, item, index) {
            const { isIntersecting } = entry;
            if (isIntersecting) {
                this.$emit('scrollDown', { item, index, entry });
            }
        }
    }
}

</script>


<style lang="scss" scoped>

@import "theme/blue.scss";
@import "scss/mixins.scss";

.scrollContainer {
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    height: 100%;
}

.scrollContent {
    @include list_reset();
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    background-color: white;
    margin-bottom: 200px;
}


/* Scroll sensor placement */

.scrollContent li {
    position: relative;
}

.scrollContainer .sensor {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 1px;
    z-index: 10;
}


/* loading barber-pole */

@keyframes scroller-loading-bg {
    from {
        background-position: -24px 0;
    }
    to {
        background-position: 24px 0;
    }
}

.loading {
    background: repeating-linear-gradient(
        -45deg,
        $gray-200,
        $gray-200 6px,
        white 6px,
        white 12px
    );
    animation-name: scroller-loading-bg;
    animation-duration: 1s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
}

</style>
