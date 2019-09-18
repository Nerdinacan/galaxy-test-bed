import { stringArray } from "./types.schema";

export default {
    title: "historycontent",
    version: 0,
    type: "object",
    properties: {
        
        type_id: { type: "string", primary: true },
        id: { type: "string", index: true },
        history_id: { type: "string", index: true },
        hid: { type: "integer", index: true },

        history_content_type: { type: "string" },
        created_time: { type: "string" },
        update_time: { type: "string" },

        name: { type: "string" },
        tags: stringArray,
        url: { type: "string" },
        isDeleted: { type: "boolean" },
        purged: { type: "boolean" },
        visible: { type: "boolean" },
        accessible: { type: "boolean" },
        state: { type: "string" },
        populated_state: { type: "string" },

        element_count: { type: "integer" },
        collection_type: { type: "string" }
    }
}
