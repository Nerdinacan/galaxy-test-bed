<template>
    <div class="display-applications">
        <div class="display-application" v-for="app in displayLinks" :key="app.label">
            <span class="display-application-location">
                {{ app.label }}
            </span>
            <span class="display-application-links">
                <a v-for="l in app.links" :key="l.href"
                    :href="l.href" :target="l.target">
                    {{ l.text }}
                </a>
            </span>
        </div>
    </div>
</template>


<script>

export default {
    props: {
        dataset: { type: Object, required: true }
    },
    computed: {

        displayLinks() {
            let result = [];
            if (this.dataset) {
                const { display_apps = [], display_types = [] } = this.dataset;
                result = [
                    ...display_apps,
                    ...display_types
                ];
            }
            return result;
        }

    }
}

</script>

