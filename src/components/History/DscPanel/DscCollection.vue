<template>
    <div class="dataset-collection"
        :data-state="state"
        @keydown.self.stop.prevent="drillDown"
        @click.stop.prevent="drillDown">

        <header class="px-3 pt-3 pb-2">
            <h4><a href="#">{{ content.title }}</a></h4>
            <p class="m-0">
                a {{ content.collectionType() | localize }}
                {{ content.collectionCount() | localize }}
            </p>
        </header>

    </div>
</template>


<script>

import DscWrapper from "../model/DscWrapper";

export default {
    props: {
        content: { type: DscWrapper, required: true }
    },
    computed: {
        state() {
            return this.content.state || "ok";
        }
    },
    methods: {
        drillDown() {
            this.$emit("selectDscItem", this.content);
        }
    }
}

</script>
