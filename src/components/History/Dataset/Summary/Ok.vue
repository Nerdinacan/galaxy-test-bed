<template functional>
    <div>
        <div v-if="props.dataset.misc_blurb" class="blurb">
            <span class="value">{{ props.dataset.misc_blurb }}</span>
        </div>
        <div v-if="props.dataset.file_ext" class="datatype">
            <label class="prompt">{{ 'format' | localize }}</label>
            <span class="value">{{ props.dataset.file_ext }}</span>
        </div>
        <div v-if="props.dataset.metadata_dbkey" class="dbkey">
            <label class="prompt">{{ 'database' | localize }}</label>
            <span class="value">{{ props.dataset.metadata_dbkey }}</span>
        </div>
        <div v-if="props.dataset.misc_info">
            <span>{{ props.dataset.misc_info }}</span>
        </div>
    </div>
</template>
