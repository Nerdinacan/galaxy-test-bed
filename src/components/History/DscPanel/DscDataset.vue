<template>
    <div class="dataset" :class="{ expanded, collapsed: !expanded }"
        :data-state="state"
        @keydown.arrow-up.self.stop.prevent="collapse"
        @keydown.arrow-down.self.stop.prevent="open"
        @keydown.space.self.stop.prevent="toggleExpand">

        <nav class="content-top-menu d-flex justify-content-between p-1"
            @click="toggleExpand">
            <icon-menu class="status-menu">
                <icon-menu-item :active="expanded"
                    :icon="expanded ? 'chevron-up' : 'chevron-down'"
                    @click.stop="toggleExpand" />
            </icon-menu>
            <dataset-menu :debug="true"
                :content="content"
                :dataset="dataset" />
        </nav>

        <header class="px-3 py-2">
            <h4>
                <a href="#" @click="toggleExpand">
                    {{ content.title }}
                </a>
            </h4>
        </header>

        <transition name="shutterfade">
            <div v-if="expanded" class="details px-3 pb-3">
                <dataset-summary :dataset="dataset" />
            </div>
        </transition>

    </div>
</template>


<script>

import datasetMixin from "../Dataset/datasetMixin";
import { IconMenu, IconMenuItem } from "components/IconMenu";
import DatasetSummary from "../Dataset/Summary";
import DatasetMenu from "../Dataset/DatasetMenu";



export default {
    mixins: [ datasetMixin ],
    components: {
        IconMenu,
        IconMenuItem,
        DatasetSummary,
        DatasetMenu
    },
    computed: {
        state() {
            return this.content.state || "ok";
        }
    }
}

</script>
