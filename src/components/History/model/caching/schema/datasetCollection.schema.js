import { nullableString, stringArray } from "./types.schema";

export default {
    title: "datasetCollections",
    version: 0,
    type: "object",
    properties: {
        history_content_type: { type: "string" },
        populated_state_message: nullableString,
        name: { type: "string" },
        populated: { type: "boolean" },
        isDeleted: { type: "boolean" },
        history_id: { type: "string" },
        tags: stringArray,
        visible: { type: "boolean" },
        job_source_id: nullableString,
        job_source_type: nullableString,
        elements: {
            type: "array",
            items: { "$ref": "#/definitions/treenode" }
        },
        collection_type: { type: "string" },
        url: { type: "string" },
        model_class: nullableString,
        hid: { type: "integer" },
        element_count: { type: "integer" },
        id: { type: "string", primary: true },
        populated_state: { type: "string" },
        update_time: { type: "string" },
        purged: { type: "boolean" },
        type_id: { type: "string" }
    },
    definitions: {

        treenode: {
            type: "object",
            properties: {
                element_index: { type: "integer" },
                element_identifier: { type: "string" },
                element_type: { type: "string" },
                model_class: { type: "string" },
                id: { type: "string" },

                // find and kill the person who named this 'object'
                "object": {
                    "$ref": "#/definitions/treeleaf"
                }
            }
        },

        treeleaf: {
            type: "object",
            properties: {
                misc_blurb: { type: "string" },
                update_time: { type: "string"},
                data_type: { type: "string" },
                tags: stringArray,
                history_id: { type: "string" },
                visible: { type: "boolean" },
                genome_build: { type: "string" },
                create_time: { type: "string" },
                hid: { type: "integer" },
                file_size: { type: "integer" },
                file_ext: { type: "string" },
                id: { type: "string" },
                misc_info: { type: "string" },
                hda_ldda: { type: "string" },
                history_content_type: { type: "string" },
                name: { type: "string" },
                uuid: { type: "string" },
                state: { type: "string" },
                model_class: { type: "string" },
                metadata_dbkey: { type: "string" },
                purged: { type: "boolean" },
                elements: {
                    type: "array",
                    items: { "$ref": "#/definitions/treenode" }
                }
            }
        }

    }
}
