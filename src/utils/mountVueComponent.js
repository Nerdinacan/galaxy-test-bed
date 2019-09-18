// Generic Vue component mount for use in transitional
// mount functions

import Vue from "vue";
import VueRx from "vue-rx";
import BootstrapVue from "bootstrap-vue";
import store from "store";
import _l from "utils/localization";

// Bootstrap components
Vue.use(BootstrapVue);

// adds subscriptions to components
Vue.use(VueRx);

// make localization filter available to all components
Vue.filter("localize", value => _l(value));
Vue.filter("l", value => _l(value));

// can also localize a block of text
Vue.directive('localize', {
    bind(el, binding, vnode) {
        el.childNodes.forEach(node => {
            node.textContent = _l(node.textContent);
        });
    }
});

export const mountVueComponent = ComponentDefinition => (propsData, el) => {
    const component = Vue.extend(ComponentDefinition);
    return new component({ store, propsData, el });
};
