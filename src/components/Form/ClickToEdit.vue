<template>
    <div ref="editor" class="clickToEdit">

        <component ref="displayElement" :is="tagName" v-if="!editing" @click="toggleEdit(true)">
            <span class="editable"></span>
            <span>{{ displayValue }}</span>
        </component>

        <b-tooltip v-if="tooltipTitle" boundary="window"
            :placement="tooltipPlacement"
            :target="() => $refs['displayElement']">
            {{ tooltipTitle }}
        </b-tooltip>

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
        displayLabel: { type: String, required: false, default: "" },
        tooltipTitle: { type: String, required: false, default: "" },
        // TODO: As usual, placement doesn't work as described by bootstrap,
        // But this is the setting you'd give it if it did.
        tooltipPlacement: { type: String, required: false, default: "auto" }
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
    watch: {
        // Need to manually close tooltips because nothing Bootstrap has
        // ever produced works as described
        editing(isEditing) {
            if (isEditing) {
                this.$root.$emit('bv::hide::tooltip');
            }
        }
    },
    methods: {
        toggleEdit(forceVal) {
            this.editing = (forceVal !== undefined) ? forceVal : !this.editing;
        },
        editorTarget() {
            if (this.$refs['editor']) {
                return this.$refs['editor']
            }
            return null;
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

.tooltip { top: 0; }

</style>
