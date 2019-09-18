<template>
    <div class="clickToEdit">

        <component :is="tagName" v-if="!editing" @click="toggleEdit(true)">
            <span class="editable"></span>
            <span>{{ displayValue }}</span>
            <slot name="tooltip" :editing="editing" :localValue="localValue"></slot>
        </component>

        <component :is="tagName" v-if="editing">
            <slot :toggleEdit="toggleEdit"
                :editing="editing"
                :placeholder="placeholder"
                :stateValidator="stateValidator">

                <debounced-input v-model="localValue" :delay="debounceDelay">
                    <template v-slot:default="inputScope">
                        <b-form-input :value="inputScope.value"
                            @input="inputScope.input"
                            @blur="toggleEdit(false)"
                            :autofocus="true"
                            :placeholder="placeholder"
                            :state="stateValidator(inputScope.value, localValue)" />
                    </template>
                </debounced-input>

            </slot>
        </component>

    </div>
</template>


<script>

import DebouncedInput from "components/Form/DebouncedInput";

const defaultStateValidator = (val, origVal) => {
    if (val === origVal) {
        return null;
    }
    return val.length > 0;
}

export default {
    components: {
        DebouncedInput
    },
    props: {
        value: { type: String, required: true },
        tagName: { type: String, required: false, default: "h2" },
        placeholder: { type: String, required: false, default: "" },
        stateValidator: { type: Function, required: false, default: defaultStateValidator },
        debounceDelay: { type: Number, required: false, default: 1000 },
        displayLabel: { type: String, required: false, default: "" }
    },
    data() {
        return {
            editing: false
        }
    },
    computed: {
        displayValue() {
            return this.displayLabel || this.localValue || this.placeholder;
        },
        localValue: {
            get() {
                return this.value
            },
            set(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.$emit('input', newVal);
                }
            }
        }
    },
    methods: {
        toggleEdit(forceVal) {
            this.editing = (forceVal !== undefined) ? forceVal : !this.editing;
        }
    }
}

</script>


<style lang="scss" scoped>

@import "theme/blue.scss";
@import "~scss/mixins.scss";

.clickToEdit {
    position: relative;
    margin-right: 1rem;
    &:hover .editable {
        @include fontawesome($fa-var-edit);
        position: absolute;
        top: 0;
        right: 0;
        color: $brand-info;
        font-size: 0.8rem;
    }
}

h1 input {
    font-size: $h1-font-size;
    font-weight: 500;
}

h2 input {
    font-size: $h2-font-size;
    font-weight: 500;
}

h3 input {
    font-size: $h3-font-size;
    font-weight: 500;
}

h4 input {
    font-size: $h4-font-size;
    font-weight: 500;
}

</style>
