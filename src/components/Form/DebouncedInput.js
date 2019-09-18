/**
 * Renderless component, used to debounce various types of form inputs
 */

import Vue from "vue";
import VueRx from "vue-rx";
import { pluck, debounceTime, distinctUntilChanged } from "rxjs/operators";

Vue.use(VueRx);

export default {
    template: "<slot></slot>",
    render() {
        return this.$scopedSlots.default({
            value: this.tmpVal,
            input: e => {
                // Of course Vue Bootstrap does not conform to the standard
                // event object, so we have to check for their incompetence
                // if we want to use this with the Vue Bootstrap components
                // console.log("input event handler", e, arguments);
                this.tmpVal = (e && e.target) ? e.target.value : e;
            }
        })
    },
    props: { 
        value: { required: true },
        delay: { type: Number, required: false, default: 500 }
    },
    data() {
        return {
            tmpVal: this.value
        }
    },
    watch: {
        value(newVal) {
            this.tmpVal = newVal;
        }
    },
    mounted() {

        const raw$ = this.$watchAsObservable('tmpVal');
        
        const debounced$ = raw$.pipe(
            pluck('newValue'),
            debounceTime(this.delay),
            distinctUntilChanged()
        );

        this.$subscribeTo(debounced$, newValue => {
            this.$emit('input', newValue);
        });
    },
    beforeDestroy() {
        // skip the line and send immediately
        // if user tabs away
        this.$emit('input', this.tmpVal);
    }
}
