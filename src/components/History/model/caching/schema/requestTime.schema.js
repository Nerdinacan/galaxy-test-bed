// Top level history object

export default {
    title: "requesttime",
    version: 0,
    type: "object",
    properties: {
        url: { type: String, primary: true },
        lastSent: { type: String } // really a utc date
    }
}
