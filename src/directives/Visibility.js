import deepEqual from "fast-deep-equal";

const observers = new WeakMap();
const configs = new WeakMap();


const deleteObserver = el => {
    if (observers.has(el)) {
        // console.log("wiping old observer", hookName);
        observers.get(el).disconnect();
        observers.delete(el);
    }
}

const buildObserver = hookName => (el, binding, vnode) => {

    // console.log("buildObserver", hookName, el);

    if (argsDifferent(el, binding, vnode)) {
        deleteObserver(el);
    }

    if (!observers.has(el)) {
        const theseConfigs = processConfig(binding, vnode);
        const { callback, options } = theseConfigs;
        if (callback && options) {

            // transform callback into a callback that operates on
            // the possible array of results
            const loopedCallback = entries => {
                const orderedEntries = [...entries].sort((a, b) => a.time - b.time);
                orderedEntries.forEach(callback);
            }

            const observer = new IntersectionObserver(loopedCallback, options);
            vnode.context.$nextTick(() => {
                observer.observe(el);
            });

            // store config and instance in weakmaps that'll garbage
            // collect when the element is gone
            observers.set(el, observer);
            configs.set(el, theseConfigs);
        }
    }
}

const argsDifferent = (el, binding, vnode) => {
    const oldConfigs = configs.get(el);
    if (!oldConfigs) return true;
    const newConfigs = processConfig(binding, vnode);
    const same = deepEqual(oldConfigs, newConfigs);
    return !same;
}

const processConfig = (binding, vnode) => {

    // default configuration
    const result = {
        callback: null,
        options: {
            root: null,
            threshold: 0
        }
    };

    // check for root reference as a binding arg
    // i.e. v-observe-visibility:nameOfRef="handler"
    const rootRefName = binding.arg;
    if (rootRefName) {
        if (rootRefName in vnode.context.$refs) {
            result.options.root = vnode.context.$refs[rootRefName];
        } else {
            return result;
        }
    }

    // if the binding value is a function, that's the callback
    if (binding.value instanceof Function) {
        result.callback = binding.value;
        return result;
    }

    // the rest of the options go on result.options
    if (binding.value instanceof Object) {
        if (binding.value.callback) {
            result.callback = binding.value.callback;
        }
        Object.assign(result.options, binding.value.options);
    }

    return result;
}


export default {
    bind: buildObserver("bind"),
    inserted: buildObserver("inserted"),
    update: buildObserver("update"),
    componentUpdated: buildObserver("componentUpdated"),
    unbind: deleteObserver
}
