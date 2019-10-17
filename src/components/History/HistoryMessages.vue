<template>
    <div v-if="hasMessages">
        <b-alert :show="history.isDeleted" variant="warning">
            {{ messages.deletedHistory | localize }}
        </b-alert>
        <b-alert :show="userOverQuota" variant="warning">
            {{ messages.quotaWarning | localize }}
        </b-alert>
    </div>
</template>


<script>

import messages from "./messages";
import { History } from "./model/History";

export default {
    mixins: [ messages ],
    props: {
        history: { type: History, required: true }
    },
    computed: {
        hasMessages() {
            return this.userOverQuota || history.isDeleted;
        }
    },
    data() {
        return {
            userOverQuota: false
        }
    }
}

</script>
