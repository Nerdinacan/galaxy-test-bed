<template>
    <a ref="link" :class="iconClasses"
        :href="href"
        :title="title | localize"
        :tabindex="tabindex"
        @click="onClick">
        <span>{{ title | localize }}</span>
        <b-tooltip v-if="useTooltip"
            ref="tooltip"
            :target="() => $refs['link']"
            :title="title | localize"
            :placement="tooltipPlacement"
            :delay="100"
            boundary="window"
        />
    </a>
</template>


<script>

export default {
    props: {
        title: { type: String, required: false, default: "" },
        icon: { type: String, required: true, default: "cog" },
        tooltipPlacement: { type: String, required: false, default: "auto" },
        useTooltip: { type: Boolean, required: false, default: true },
        disabled: { type: Boolean, required: false, default: false },
        active: { type: Boolean, required: false, default: false },
        tabindex: { type: Number, required: false, default: -1 },
        href: { type: String, required: false, default: "#" }
    },
    computed: {
        iconClasses() {
            const { disabled, active } = this;
            return {
                fa: true,
                [`fa-${this.icon}`]: true,
                disabled,
                active
            }
        }
    },
    methods: {
        onClick(evt) {
            if (!this.disabled) {
                if (this.useTooltip && this.$refs.tooltip) {
                    this.$refs.tooltip.$emit('close');
                }
                this.$emit('click', evt)
            }
        }
    }
}

</script>


<style lang="scss" scoped>

@import "theme/blue.scss";
@import "scss/mixins.scss";

a {
    /* center icon */
    position: relative;
    &:before {
        @include absCenter();
    }

    /* sizing */
    height: 1.25rem;
    width: 1.25rem;
    font-size: 125%;

    text-decoration: none;
    cursor: pointer;
    outline: 0;

    margin-left: 1px;
    &:first-child {
        margin-left: 0;
    }

    span {
        @include forScreenReader();
    }
}

/* coloring */
a {
    color: $btn-default-color;
    background-color: rgba(255,255,255,0.4);

    &.disabled {
        color: #bbb;
    }
    &.active {
        color: white;
        background-color: adjust-color($btn-default-color, $alpha: -0.5);
    }
    &:hover {
        color: white;
        background-color: $brand-info;
    }
}

</style>
