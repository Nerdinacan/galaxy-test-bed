<template>
    <click-to-edit class="annotation" tagName="p"
        :value="annotation" ref="annotationInput"
        :placeholder="placeholder | localize"
        :tooltip-title="tooltipTitle | localize"
        :tooltip-placement="tooltipPlacement">

        <template v-slot:default="{ toggleEdit, placeholder, stateValidator }">
            <debounced-input v-model="annotation" :delay="1000">
                <template v-slot:default="inputScope">
                    <b-form-textarea size="sm" tabindex="-1"
                        rows="1" max-rows="5"
                        :value="inputScope.value"
                        @input="inputScope.input"
                        @blur="toggleEdit(false)"
                        :placeholder="placeholder"
                        :state="stateValidator(inputScope.value, annotation)"
                    ></b-form-textarea>
                </template>
            </debounced-input>
        </template>

    </click-to-edit>

</template>

<script>

import DebouncedInput from "components/Form/DebouncedInput";
import ClickToEdit from "./ClickToEdit";

export default {
    components: {
        DebouncedInput,
        ClickToEdit
    },
    props: {
        value: { type: String, required: false, default: "" },
        placeholder: { type: String, required: false, default: "Click to edit annotation" },
        tooltipTitle: { type: String, required: false, default: "Click to edit annotation" },
        tooltipPlacement: { type: String, required: false, default: "left" }
    },
    computed: {
        annotation: {
            get() {
                return this.value || "";
            },
            set(newVal, oldVal) {
                if (newVal !== oldVal) {
                    this.$emit('input', newVal);
                }
            }
        }
    }
}

</script>


<style lang="scss" scoped>

.annotation /deep/ p {
    position: relative;
    font-style: italic;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
}

</style>
