<template>
    <section v-if="history" class="history d-flex flex-column h-100">

        <header class="p-3">
            <slot name="history-top-nav"
                :history="history"
                :params="params"
                :content="content"
                :loading="loading"></slot>
            <history-messages class="history-messages"
                :history="history" />
            <history-details class="history-details"
                :history="history" />
        </header>

        <b-alert v-if="history.empty" class="m-3" show>
            <history-empty />
        </b-alert>

        <content-selection v-if="params && content && !history.empty" class="px-3 py-2"
            :history="history"
            :content="content"
            :params.sync="params" />

        <content-list v-if="params && content && !history.empty" class="flex-grow-1"
            :history="history"
            :content="content"
            :loading.sync="loading"
            :params.sync="params" />

    </section>
</template>


<script>

import { mapState } from "vuex";
import { tap, map, filter, pluck, distinctUntilChanged, startWith } from "rxjs/operators";
import { ContentLoader } from "./model/ContentLoader";
import { SearchParams } from "./model/SearchParams";

import HistoryDetails from "./HistoryDetails";
import HistoryMessages from "./HistoryMessages";
import ContentSelection from "./Content/ContentSelection";
import ContentList from "./Content/ContentList";
import HistoryEmpty from "./HistoryEmpty";


export default {
    components: {
        HistoryDetails,
        HistoryMessages,
        ContentSelection,
        ContentList,
        HistoryEmpty
    },
    props: {
        historyId: { type: String, required: true }
    },
    computed: {

        ...mapState("history", [
            "histories"
        ]),

        history() {
            return this.histories.find(h => h.id == this.historyId);
        }
    },
    data() {
        return {
            params: null,
            loading: false
        }
    },
    watch: {
        // reset params if history changes
        history: {
            handler(newHistory, oldHistory) {
                if (newHistory) {
                    if (!oldHistory || (newHistory.id !== oldHistory.id)) {
                        this.params = SearchParams.createForHistory(newHistory);
                    }
                }
            },
            immediate: true
        }
    },
    subscriptions() {

        const param$ = this.$watchAsObservable('params').pipe(
            pluck('newValue'),
            startWith(this.params),
            filter(Boolean),
            distinctUntilChanged(SearchParams.equals),
            tap(p => this.loading = true)
        );

        const content = param$.pipe(
            ContentLoader({
                interval: 5000,
                suppressPolling: true,
                suppressManualLoad: false
            })
        )

        return { content }
    }

}

</script>
