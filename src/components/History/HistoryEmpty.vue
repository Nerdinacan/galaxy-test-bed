<template>
    <div>
        <h4>
            <i class="fa fa-info-circle"></i> This history is empty.
        </h4>
        <p>
            You can <a href="#" @click.prevent="openUploader" v-localize>load your own data</a> or
            <a href="#" @click.prevent="clickDataLink" v-localize>get data from an external source</a>.
        </p>
    </div>
</template>

<script>

// import { openUploader, getDataLoadLink } from "legacyAdapter";

export default {
    methods: {
        openUploader() {
            console.log("openUploader");
        },
        clinkDataLink() {
            console.log("clinkDataLink");
            // getDataLoadLink().click();
        }
    }
}

</script>
