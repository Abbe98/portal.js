import { storiesOf } from '@storybook/vue';
import Vuex from 'vuex';
import VueI18n from 'vue-i18n';
import MediaActionBar from './MediaActionBar.vue';

const store = new Vuex.Store({
  getters: {
    'http/canonicalUrl': () => {}
  }
});

const i18n = new VueI18n({
  locale: 'en',
  messages: {
    en: {
      actions: {
        share: 'Share',
        viewAt: 'View at {link}',
        download: 'Download'
      }
    }
  }
});

storiesOf('Item page', module)
  .add('Media action bar', () => ({
    components: { MediaActionBar },
    i18n,
    store,
    data() {
      return {
        media: [
          {
            about: 'http://www.mimo-db.eu/media/GNM/IMAGE/MIR1097_1279787057222_2.jpg',
            thumbnails: {
              small: 'https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w200&type=IMAGE&uri=http%3A%2F%2Fwww.mimo-db.eu%2Fmedia%2FGNM%2FIMAGE%2FMIR1097_1279787057222_2.jpg'
            }
          },
          {
            about: 'http://www.mimo-db.eu/media/GNM/IMAGE/MIR1097_1289919650555_2.jpg',
            thumbnails: {
              small: 'https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w200&type=IMAGE&uri=http%3A%2F%2Fwww.mimo-db.eu%2Fmedia%2FGNM%2FIMAGE%2FMIR1097_1289919650555_2.jpg'
            }
          },
          {
            about: 'http://www.mimo-db.eu/media/GNM/IMAGE/MIR1097_1279787078144_2.jpg',
            thumbnails: {
              small: 'https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w200&type=IMAGE&uri=http%3A%2F%2Fwww.mimo-db.eu%2Fmedia%2FGNM%2FIMAGE%2FMIR1097_1279787078144_2.jpg'
            }
          }
        ],
        selected: 'http://www.mimo-db.eu/media/GNM/IMAGE/MIR1097_1279787057222_2.jpg'
      };
    },
    template: `
      <b-container class="mt-3">
        <div class="card p-3 mb-3 mt-3 bg-grey">
          <MediaActionBar
            europeana-identifier="identifier"
            rights-statement="http://rightsstatements.org/vocab/InC/1.0/"
            url="http://delibra.bg.polsl.pl/Content/9191/Diody_DOG31_DOG_61-63_AB.pdf"
            is-shown-at="http://fbc.pionier.net.pl/id/oai:delibra.bg.polsl.pl:9191"
            data-provider-name="Biblioteka Cyfrowa Politechniki"
            data-provider-lang=""
            :use-proxy="true"
          />
        </div>
      </b-container>
    `
  }));
