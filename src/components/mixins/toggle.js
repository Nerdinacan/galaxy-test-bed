/**
 * Toggles a local bool parameter.
 */

export default {
    methods: {

        toggle(paramName, forceVal) {
            if (!(paramName in this)) {
                console.warn("Missing toggle parameter", paramName);
                return;
            }
            if (forceVal === undefined) {
                this[paramName] = !this[paramName];
            }
            else {
                this[paramName] = forceVal;
            }
        }

    }
}
