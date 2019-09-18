import { nullableString, nullableInteger, stringArray }
    from "./types.schema";

const MetaFile = {
    type: "object",
    properties: {
        file_type: { type: "string" },
        download_url: { type: "string" }
    }
}

const DisplayLink = {
    type: "object",
    properties: {
        text: { type: "string" },
        href: { type: "string" },
        target: { type: "string" }
    }
}

const DisplayLinkList = {
    type: "object",
    properties: {
        links: {
            type: "array",
            item: DisplayLink
        },
        label: { type: "string" },
    }
}

export default {
    title: "dataset",
    version: 0,
    type: "object",
    properties: {
        accessible: { type: "boolean" },
        annotation: nullableString,
        api_type: { type: "string" },
        create_time: { type: "string" },
        creating_job: nullableString,
        data_type: { type: "string" },
        dataset_id: { type: "string" },
        isDeleted: { type: "boolean" },
        // display_apps: stringArray,
        display_types: {
            type: "array",
            items: DisplayLinkList
        },
        display_apps: {
            type: "array",
            items: DisplayLinkList
        },
        download_url: { type: "string" },
        extension: { type: "string" },
        file_ext: { type: "string" },
        file_name: { type: "string" },
        file_size: { type: "integer" },
        genome_build: { type: "string" },
        hda_ldda: { type: "string" },
        hid: { type: "integer" },
        history_content_type: { type: "string" },
        history_id: { type: "string" },
        id: { type: "string", primary: true },
        meta_files: {
            type: "array",
            items: MetaFile
        },
        metadata_column_types: {
            type: ["null", "array"],
            items: { type: "string" }
        },
        metadata_column_names: {
            type: ["null", "array"],
            items: { type: "string" }
        },
        metadata_comment_lines: nullableInteger,
        metadata_data_lines: nullableInteger,
        metadata_dbkey: { type: "string" },
        metadata_sequences: nullableInteger,
        misc_blurb: nullableString,
        misc_info: nullableString,
        model_class: { type: "string" },
        name: { type: "string" },
        peek: nullableString,
        permissions: {
            type: "object",
            properties: {
                access: stringArray,
                manage: stringArray
            }
        },
        purged: { type: "boolean" },
        rerunnable: { type: "boolean" },
        resubmitted: { type: "boolean" },
        state: { type: "string" },
        tags: stringArray,
        type: { type: "string" },
        type_id: { type: "string" },
        update_time: { type: "string" },
        url: { type: "string" },
        uuid: { type: "string" },
        visible: { type: "boolean" },
        // visualizations: stringArray,
        viz_count: { type: "integer" }
    }
}
