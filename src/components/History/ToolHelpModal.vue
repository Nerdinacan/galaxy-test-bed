<template>
    <b-modal v-model="showModal" :title="modalTitle">
        <div v-if="helpHtml.length" v-html="helpHtml"></div>
        <p v-else>{{ messages.nohelp | localize }}</p>
    </b-modal>
</template>


<script>

import { loadToolFromJob } from "components/History/model/queries";
import messages from "./messages";

export default {
    mixins: [ messages ],
    props: {
        showToolHelp: { type: Boolean, required: false, default: false },
        jobId: { type: String, required: true },
    },
    data() {
        return {
            tool: null
        }
    },
    computed: {
        modalTitle() {
            return this.tool ? `Tool Help: ${this.tool.name}` : "Tool Help";
        },
        helpHtml() {
            return this.tool ? this.tool.help : "";
        },
        showModal: {
            get() {
                return this.showToolHelp && (this.helpHtml.length > 0);
            },
            set(val) {
                this.$emit('update:showToolHelp', val);
            }
        }
    },
    methods: {
        async toggleToolHelp(jobId) {
            this.tool = await loadToolFromJob(jobId);
        }
    },
    watch: {
        showToolHelp(bShow) {
            if (bShow) {
                this.toggleToolHelp(this.jobId)
            }
        }
    }
}

</script>
