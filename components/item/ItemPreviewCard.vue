<template>
  <ContentCard
    :title="dcTitle || dcDescription"
    :url="url"
    :image-url="edmPreview"
    :texts="texts"
    :hits-text="hitsText"
    :show-user-buttons="showUserButtons"
    :class="cardClass"
    :limit-values-within-each-text="3"
    :omit-all-uris="true"
    :blank-image-height="280"
    :variant="variant"
  />
</template>

<script>
  import ContentCard from '../generic/ContentCard';

  export default {
    name: 'ItemPreviewCard',

    components: {
      ContentCard
    },

    props: {
      europeanaId: {
        type: String,
        required: true
      },

      dcTitle: {
        // may be a string or a lang map
        type: [String, Object],
        default: null
      },

      dcDescription: {
        // may be a string or a lang map
        type: [String, Object],
        default: null
      },

      edmDataProvider: {
        type: [String, Object],
        default: null
      },

      dcCreator: {
        type: [String, Object],
        default: null
      },

      edmPreview: {
        type: String,
        default: null
      },

      selector: {
        type: Object,
        default: null
      },

      variant: {
        type: String,
        default: 'default' // other options: entity, mini, list
      }
    },

    computed: {
      texts() {
        const texts = [this.edmDataProvider];
        if (this.dcCreator) texts.unshift(this.dcCreator);

        if (this.variant === 'list') {
          if (!this.selector && this.dcDescription) texts.unshift(this.dcDescription);
        }

        return texts;
      },

      hitsText() {
        return this.variant === 'list' ? this.selector : null;
      },

      cardClass() {
        return this.variant === 'list' ? 'mx-0' : null;
      },

      showUserButtons() {
        return Boolean(Number(process.env.ENABLE_XX_USER_AUTH)) && (this.variant === 'default');
      },

      url() {
        return { name: 'item-all', params: { pathMatch: this.europeanaId.slice(1) } };
      }
    }
  };
</script>