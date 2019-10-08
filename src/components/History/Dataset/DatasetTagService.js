import { TagService } from "components/Tags/tagService";
import { createTag } from "components/Tags/model";
import { updateDataset } from "components/History/model/Dataset";


// TODO: refactor Tags (again). Not liking this service injection
// essentially all we need to do is write our own Tags instead
// of attempting to leverage the npm package I selected before

export class DatasetTagService extends TagService {

    constructor(dataset, history_id) {
        super({
            id: dataset.id,
            itemClass: "HistoryDatasetAssociation",
            context: "dataset-item-component"
        });
        this.dataset = dataset;
        this.history_id = history_id;
    }

    async save(rawTag) {
        const tag = createTag(rawTag);
        const tagSet = new Set(this.dataset.tags);
        tagSet.add(tag.text);
        await this.saveDatasetTags(tagSet);
        return tag;
    }

    async delete(rawTag) {
        const tag = createTag(rawTag);
        const tagSet = new Set(this.dataset.tags);
        tagSet.delete(tag.text);
        await this.saveDatasetTags(tagSet);
        return tag;
    }

    async saveDatasetTags(rawTags) {
        const body = {};
        body.tags = Array.from(rawTags);
        return await updateDataset(this.dataset, body).toPromise();
    }

}
