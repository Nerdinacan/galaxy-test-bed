// Top level history object

import { nullableString, stringArray } from "./types.schema";

export default {
    title: "history",
    version: 0,
    type: "object",
    properties: {
        hid_counter: { type: "number" },
        importable: { type: "boolean" },
        create_time: { type: "string" },
        contents_url: { type: "string" },
        id: { type: "string", primary: true },
        size: { type: "number" },
        user_id: { type: ["null", "string"] },
        contents_active: {
            type: "object",
            properties: {
                active: { type: "integer", default: 0 },
                deleted: { type: "integer", default: 0 },
                hidden: { type: "integer", default: 0 },
            }
        },
        username_and_slug: nullableString,
        annotation: nullableString,
        empty: { type: "boolean" },
        update_time: { type: "string" },
        tags: {
            type: "array",
            item: { type: "string" }
        },
        isDeleted: { type: "boolean" },
        non_ready_jobs: stringArray,
        genome_build: nullableString,
        nice_size: { type: "string" },
        slug: nullableString,
        name: { type: "string" },
        url: { type: "string" },
        published: { type: "boolean" },
        model_class: { type: "string" },
        purged: { type: "boolean" }
    }
}
