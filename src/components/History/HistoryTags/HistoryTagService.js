import { TagService } from "components/Tags/tagService";
import { createTag } from "components/Tags/model";
import store from "store";


export class HistoryTagService extends TagService {

    constructor(history) {
        super({
            id: history.id,
            itemClass: "History",
            context: "history-panel"
        });
        this.history = history;
    }

    async save(rawTag) {
        const tag = createTag(rawTag);
        const tagSet = new Set(this.history.tags);
        tagSet.add(tag.text);
        this.saveHistoryTags(tagSet);
        return tag;
    }

    async delete(rawTag) {
        const tag = createTag(rawTag);
        const tagSet = new Set(this.history.tags);
        tagSet.delete(tag.text);
        this.saveHistoryTags(tagSet);
        return tag;
    }

    saveHistoryTags(rawTags) {
        store.dispatch("history/updateHistoryFields", {
            history: this.history,
            fields: {
                tags: Array.from(rawTags)
            }
        });
    }

}
