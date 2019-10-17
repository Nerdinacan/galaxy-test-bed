<template>
    <div class="content-list">

        <transition name="fade">

            <scroller v-if="content.length" key="listing"
                :items="content" keyProp="type_id"
                :buffer="bottomBufferSize"
                :loading="loading"
                @scrollDown="onScrollDown">
                <template #default="{ item, index }">
                    <content-item class="mb-1"
                        :content="item"
                        :tabindex="index"
                        :data-content-index="index"
                        @focusItem="setFocus(index)"
                        @shiftUp="setFocus(index - 1)"
                        @shiftDown="setFocus(index + 1)"
                    />
                </template>
            </scroller>

            <div v-else key="loadingWarning">
                Loading?
            </div>

        </transition>

    </div>
</template>


<script>

import { History } from "../model/History";
import { Content } from "../model/Content";
import { SearchParams } from "components/History/model/SearchParams";
import Scroller from "components/Scroller";
import ContentItem from "./ContentItem";

export default {
    components: {
        Scroller,
        ContentItem,
    },
    props: {
        history: { type: History, required: true },
        content: {
            type: Array,
            required: false,
            default: () => [],
            validator: list => list.reduce((isValid, item) => {
                return isValid && item instanceof Content;
            },true)
        },
        params: { type: SearchParams, required: true },
        loading: { type: Boolean, required: false, default: false }
    },
    computed: {
        bottomBufferSize() {
            return Math.floor(SearchParams.pageSize / 2);
        }
    },
    methods: {

        // don't update any observed props/data or we get a re-render
        setFocus(idx) {
            const el = this.$el.querySelector(`[data-content-index="${idx}"]`);
            if (el) {
                el.focus();
            }
        },

        // simplified pagination scheme: just extend limit whe we get a scrollDown event
        // TODO: come back and finish virtual scrolling component for huge listings
        onScrollDown({ item, index, entry }) {
            // a sensor near the bottom of the page has scrolled into view
            // set the limit to be further down after the index that appeared
            this.$emit("update:params", this.params.extendLimit());
        }

    },
    watch: {
        content(newContent) {
            this.$emit("update:loading", false);
        }
    }
}

</script>


<style lang="scss">
@import "scss/transitions.scss";
</style>
