import { pipe } from "rxjs";
import { filter } from "rxjs/operators";

export const validateType = (type, errMsg) => pipe(
    filter(val => {
        if (val instanceof type) {
            return true;
        }
        const msg = errMsg || `Value is wrong type, expected: ${type.constructor.name}`;
        throw new Error(msg);
    })
)

export const validate = (validator, errMsg) => pipe(
    filter(val => {
        if (validator(val)) {
            return true;
        }
        const msg = errMsg || "Value is wrong type";
        throw new Error(msg);
    })
)