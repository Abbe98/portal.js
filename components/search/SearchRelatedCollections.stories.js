import { storiesOf } from '@storybook/vue';
import Vuex from 'vuex';
import RelatedCollections from '../generic/RelatedCollections.vue';

const i18n = {
  locale: 'en',
  messages: {
    en: {
      collectionsYouMightLike: 'Collections you might like'
    }
  }
};

const store = () => new Vuex.Store({
  getters: {
    'apis/config': () => ({
      data: {
        origin: 'http://data.europeana.eu'
      }
    })
  }
});

storiesOf('Search', module)
  .add('Search Related Collections', () => ({
    components: { RelatedCollections },
    i18n,
    store,
    data() {
      return {
        relatedCollections: [
          {
            name: 'Emilio Pucci',
            identifier: 'http://data.europeana.eu/agent/base/69103'
          },
          {
            name: 'Christian Lacroix',
            identifier: 'http://data.europeana.eu/agent/base/66273'
          },
          {
            name: 'Jewellery',
            identifier: 'http://data.europeana.eu/concept/base/41'
          },
          {
            name: 'Costume',
            identifier: 'http://data.europeana.eu/concept/base/33'
          }
        ]
      };
    },
    template: `
      <b-container
        class='mt-3'
      >
        <RelatedCollections
          :title='$t("collectionsYouMightLike")'
          :related-collections='relatedCollections'
        />
      </b-container>`
  }));
