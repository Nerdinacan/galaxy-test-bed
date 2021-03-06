import Vue from 'vue'
import VueRx from "vue-rx";
import BootstrapVue from "bootstrap-vue";

import _l from "utils/localization";
import App from "./App";
import store from "store";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "theme/blue.scss";

// Bootstrap components
Vue.use(BootstrapVue);

// adds subscriptions to components
Vue.use(VueRx);

// make localization filter available to all components
Vue.filter("localize", value => _l(value));
Vue.filter("l", value => _l(value));

// can also localize a block of text
Vue.directive('localize', {
    bind(el) {
        el.childNodes.forEach(node => {
            node.textContent = _l(node.textContent);
        });
    }
});

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
