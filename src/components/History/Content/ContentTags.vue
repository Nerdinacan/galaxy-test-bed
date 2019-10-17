<template>
    <stateless-tags :value="tags"
        @before-adding-tag="saveContentTag"
        @before-deleting-tag="deleteContentTag" />
</template>

<script>

import { Content } from "../model/Content";
import { StatelessTags, createTag } from "components/Tags";
import { updateContent } from "../model/Content";

export default {
    components: {
        StatelessTags
    },
    props: {
        content: {
            type: Content,
            required: true,
            validator: val => {
                if (undefined == val.tags) {
                    console.warn("Missing tags property in passed content model");
                    return false;
                }
                if (undefined == val.type_id) {
                    console.warn("Missing type_id in passed content model");
                    return false;
                }
                return true;
            }
        }
    },
    computed: {
        tags() {
            return this.content.tags;
        }
    },
    methods: {
        async saveContentTag({ tag, addTag }) {
            const newTag = createTag(tag);
            if (!newTag.valid) return;
            const tagSet = new Set(this.tags);
            tagSet.add(newTag.text);
            const tags = Array.from(tagSet);
            const newContent = await updateContent(this.content, { tags });
            addTag(newTag);
        },
        async deleteContentTag({ tag, deleteTag }) {
            const doomedTag = createTag(tag);
            if (!doomedTag.valid) return;
            const tagSet = new Set([ ...this.tags ])
            tagSet.delete(doomedTag.text);
            const tags = Array.from(tagSet);
            const newContent = await updateContent(this.content, { tags });
            deleteTag(tag);
        }
    }
}

</script>