<template>
  <b-dropdown-form>
    <strong
      class="mb-4 d-inline-block"
    >
      {{ $t(`facets.${facet.name}`).name }}
    </strong>
    <b-form-checkbox-group
      v-model="selected"
      class="option-group"
      plain
    >
      <b-form-checkbox
        v-for="(filter, indx) in [].concat(facet.fields).splice(0, limitTo)"
        :id="`${$t(`facets.${facet.name}`).name} - ${filter.label}`"
        :key="indx"
        :value="filter.label"
        :name="filter.label"
        class="mb-3"
      >
        {{ filter.label }}
        <span
          class="reset"
          :aria-label="$t('facets.button.reset')"
        >
          <span
            class="icon-close"
            aria-hidden="true"
            :title="`Reset ${filter.label}`"
          />
        </span>
      </b-form-checkbox>
      <div
        v-if="facet.fields.length > limitTo"
        v-show="isActive"
        class="option-group"
      >
        <b-form-checkbox
          v-for="(filter, indx) in [].concat(facet.fields).splice(limitTo)"
          :id="`${$t(`facets.${facet.name}`).name} - ${filter.label}`"
          :key="indx"
          :value="filter.label"
          :name="filter.label"
          class="mb-3"
          plain
        >
          {{ filter.label }}
          <span
            class="reset"
            :aria-label="$t('facets.button.reset')"
          >
            <span
              class="icon-close"
              aria-hidden="true"
              :title="`Reset ${filter.label}`"
            />
          </span>
        </b-form-checkbox>
      </div>
      <button
        v-if="facet.fields.length > limitTo"
        type="button"
        class="btn btn-link btn-toggle"
        :class="{ 'is-active': isActive }"
        :data-qa="(isActive ? $t(`facets.button.hideAll`) : $t(`facets.button.showAll`)) + ' ' + $t(`facets.${facet.name}`).plural + ' button'"
        @click.prevent="isActive = !isActive"
      >
        {{ isActive ? $t(`facets.button.hideAll`) : $t(`facets.button.showAll`) }} {{ $t(`facets.${facet.name}`).plural }}
      </button>
    </b-form-checkbox-group>
  </b-dropdown-form>
</template>

<script>
  export default {
    props: {
      index: {
        type: Number,
        required: true
      },
      facet: {
        type: Object,
        required: true
      }
    },

    data() {
      return {
        isActive: false,
        limitTo: 9,
        selected: ''
      };
    },

    watch: {
      selected() {
        this.$store.commit('search/setMoreFilters', this.selected);
      }
    }
  };
</script>
