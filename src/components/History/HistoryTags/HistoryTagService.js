import { TagService } from "components/Tags/tagService";
import { createTag } from "components/Tags/model";
import { updateHistoryFields } from "../model/History";

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
        await this.saveHistoryTags(tagSet);
        return tag;
    }

    async delete(rawTag) {
        const tag = createTag(rawTag);
        const tagSet = new Set(this.history.tags);
        tagSet.delete(tag.text);
        await this.saveHistoryTags(tagSet);
        return tag;
    }

    async saveHistoryTags(rawTags) {
        const tags = Array.from(rawTags);
        return await updateHistoryFields(this.history, { tags });
    }

}
