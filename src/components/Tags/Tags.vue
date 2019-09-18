<template>
    <stateless-tags
        v-model="observedTags"
        :disabled="disabled"
        :autocomplete-items="autocompleteItems"
        :useToggleLink="useToggleLink"
        @tag-click="onClick"
        @tag-input-changed="updateTagSearch"
        @before-adding-tag="beforeAddingTag"
        @before-deleting-tag="beforeDeletingTag"
    />
</template>

<script>
import Vue from "vue";
import VueRx from "vue-rx";
import { mapActions } from "vuex";
import { map } from "rxjs/operators";
import StatelessTags from "./StatelessTags";
import { diffTags } from "./model";
import { TagService } from "./tagService";

Vue.use(VueRx);

export default {
    components: {
        StatelessTags
    },

    props: {
        // initialization value
        tags: { type: Array, required: false, default: () => [] },

        // data requests go through this object
        tagService: { type: TagService, required: true },

        // store key, usually a model ID or something like that
        storeKey: { type: String, required: true },

        // allows user to edit tag list
        disabled: { type: Boolean, required: false, default: false },

        // uses toggle link when lots of tags
        useToggleLink: { type: Boolean, required: false, default: true }
    },

    computed: {
        observedTags: {
            get() {
                const getter = this.$store.getters["tags/getTagsById"];
                return getter(this.storeKey);
            },
            set(tags) {
                this.updateTags({ key: this.storeKey, tags });
            }
        }
    },

    subscriptions() {
        return {
            autocompleteItems: this.tagService.autocompleteOptions.pipe(
                // without the ones we've already selected
                map(resultTags => diffTags(resultTags, this.tags))
            )
        };
    },

    methods: {
        onClick(tag) {
            this.$emit("tag-click", tag);
        },

        beforeAddingTag({ tag, addTag }) {
            this.tagService
                .save(tag)
                .then(() => addTag(tag))
                .catch(err => console.warn("Unable to save tag", err));
        },

        beforeDeletingTag({ tag, deleteTag }) {
            this.tagService
                .delete(tag)
                .then(() => deleteTag(tag))
                .catch(err => console.warn("Unable to delete tag", err));
        },

        // Set search value on tag service input proprety and eventually search
        // results will appear on the tagService.autocompleteOptions observable
        // object which is subscribed to above

        updateTagSearch(searchTxt) {
            this.tagService.autocompleteSearchText = searchTxt;
        },

        ...mapActions("tags", ["updateTags", "initializeTags"])
    },

    mounted() {
        this.initializeTags({ key: this.storeKey, tags: this.tags });
    }
};
</script>
