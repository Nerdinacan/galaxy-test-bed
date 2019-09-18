// Object.assign, but props transferred must exist in target

export function safeAssign(target, ...sources) {
    const source = Object.assign({}, ...sources);
    Object.keys(target)
        .filter(prop => source.hasOwnProperty(prop))
        .forEach(prop => target[prop] = source[prop]);
    return target;
}
