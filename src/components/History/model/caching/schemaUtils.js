// create duplicate object with only keys in schema

export const conformToSchema = schema => {

    const validKeys = Object.keys(schema.properties);
    validKeys.push('_rev');

    return instance => validKeys.reduce((result, prop) => {
        const val = instance[prop];
        if (val !== undefined) {
            result[prop] = instance[prop];
        }
        return result;
    }, {})
}



// Cleans off input props if they don't belong in the schema.
// Does so through mutation, yuck

export const pruneToSchema = schema => {

    const validKeys = Object.keys(schema.properties);
    validKeys.push('_rev');

    return instance => {
        Object.keys(instance).forEach(instancePropName => {
            if (!validKeys.includes(instancePropName)) {
                delete instance[instancePropName];
            }
        })
    }
}
