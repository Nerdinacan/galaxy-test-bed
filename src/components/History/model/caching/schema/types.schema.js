export const nullable = (t = "string") => ({
    type: [ t, "null" ]
})

export const nullableString = nullable("string");

export const nullableInteger = nullable("integer");

export const stringArray = { 
    type: "array", 
    items: { type: "string" }
}
