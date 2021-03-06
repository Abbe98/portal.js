<template>
  <div>
    <NotificationBanner
      v-if="redirectNotificationsEnabled"
      :notification-url="notificationUrl"
      :notification-text="$t('linksToClassic.record.text')"
      :notification-link-text="$t('linksToClassic.record.linkText')"
    />
    <b-container v-if="error">
      <AlertMessage
        :error="error"
      />
    </b-container>
    <b-container
      v-else
      data-qa="item page"
    >
      <b-row class="my-5">
        <b-col
          cols="12"
          lg="9"
        >
          <div class="card px-3 pt-3 mb-3">
            <div
              class="card-grid"
              :class="cardGridClass"
            >
              <header
                v-if="titlesInCurrentLanguage"
                class="card-heading"
              >
                <template
                  v-for="(heading, index) in titlesInCurrentLanguage"
                >
                  <h1
                    v-if="index === 0"
                    :key="index"
                    :lang="heading.code"
                  >
                    {{ heading.value }}
                  </h1>
                  <p
                    v-else
                    :key="index"
                    :lang="heading.code"
                    class="font-weight-bold"
                  >
                    {{ heading.value }}
                  </p>
                </template>
              </header>
              <client-only>
                <div class="media-presentation">
                  <MediaPresentation
                    :europeana-identifier="identifier"
                    :media="selectedMedia"
                    :image-src="selectedMediaImage.src"
                  />
                  <MediaThumbnailGrid
                    v-if="displayMediaThumbnailGrid"
                    :media="media"
                    :selected="selectedMedia.about"
                    @select="selectMedia"
                  />
                </div>
              </client-only>
              <div
                v-if="descriptionInCurrentLanguage"
                class="description"
              >
                <div
                  v-for="(value, index) in descriptionInCurrentLanguage.values"
                  :key="index"
                >
                  <!-- eslint-disable vue/no-v-html -->
                  <p
                    :lang="descriptionInCurrentLanguage.code"
                    v-html="$options.filters.convertNewLine(value)"
                  />
                  <!-- eslint-disable vue/no-v-html -->
                  <hr
                    v-if="(index + 1) < descriptionInCurrentLanguage.values.length"
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="card p-3 mb-3 bg-grey">
            <MediaActionBar
              :url="selectedMedia.about"
              :europeana-identifier="identifier"
              :use-proxy="useProxy"
              :rights-statement="rightsStatement"
              :data-provider-name="dataProvider.values[0]"
              :data-provider-lang="dataProvider.code"
              :is-shown-at="isShownAt"
            />
          </div>

          <MetadataBox
            :all-metadata="allMetaData"
            :core-metadata="coreFields"
            :transcribing-annotations="transcribingAnnotations"
          />

          <section
            v-if="similarItems && similarItems.length > 0"
          >
            <h2>{{ $t('record.similarItems') }}</h2>
            <ItemPreviewCardGroup
              v-model="similarItems"
              view="similar"
              class="mb-3"
            />
          </section>
        </b-col>
        <b-col
          cols="12"
          lg="3"
        >
          <h2
            v-if="relatedEntities && relatedEntities.length > 0"
            class="related-heading text-uppercase"
          >
            {{ $t('contentYouMightLike') }}
          </h2>
          <EntityCards
            v-if="relatedEntities"
            :entities="relatedEntities"
            data-qa="related entities"
          />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import axios from 'axios';
  import { mapGetters } from 'vuex';

  import ClientOnly from 'vue-client-only';
  import MediaActionBar from '../../components/item/MediaActionBar';
  import MediaPresentation from '../../components/item/MediaPresentation';
  import MetadataBox from '../../components/item/MetadataBox';

  import { getRecord, similarItemsQuery } from '../../plugins/europeana/record';
  import { search } from '../../plugins/europeana/search';
  import { isIIIFPresentation, isRichMedia } from '../../plugins/media';
  import { langMapValueForLocale } from  '../../plugins/europeana/utils';
  import { findEntities } from '../../plugins/europeana/entity';
  import { search as searchAnnotations } from '../../plugins/europeana/annotation';

  export default {
    components: {
      AlertMessage: () => import('../../components/generic/AlertMessage'),
      ClientOnly,
      EntityCards: () => import('../../components/entity/EntityCards'),
      MediaActionBar,
      ItemPreviewCardGroup: () => import('../../components/item/ItemPreviewCardGroup'),
      MediaPresentation,
      MediaThumbnailGrid: () => import('../../components/item/MediaThumbnailGrid'),
      MetadataBox,
      NotificationBanner: () => import('../../components/generic/NotificationBanner')
    },

    fetch() {
      const annotationSearchParams = {
        query: `target_record_id:"${this.identifier}"`,
        profile: 'dereference'
      };
      axios.all([
        searchAnnotations(annotationSearchParams),
        findEntities(this.europeanaEntityUris),
        this.getSimilarItems()
      ])
        .then(axios.spread((annotations, entities, similar) => {
          this.annotations = annotations;
          this.transcribingAnnotations = this.annotationsByMotivation('transcribing');
          this.taggingAnnotations = this.annotationsByMotivation('tagging');
          this.relatedEntities = entities;
          this.similarItems = similar.items;
        }));
    },

    fetchOnServer: false,

    asyncData({ params, res, query }) {
      return getRecord(`/${params.pathMatch}`, { origin: query.recordApi })
        .then((result) => {
          return result.record;
        })
        .catch((error) => {
          if (typeof res !== 'undefined') {
            res.statusCode = (typeof error.statusCode === 'undefined') ? 500 : error.statusCode;
          }
          return { error: error.message };
        });
    },

    data() {
      return {
        agents: null,
        altTitle: null,
        cardGridClass: null,
        concepts: null,
        coreFields: null,
        description: null,
        error: null,
        fields: null,
        identifier: null,
        isShownAt: null,
        media: [],
        relatedEntities: [],
        selectedMediaItem: null,
        similarItems: [],
        annotations: [],
        taggingAnnotations: [],
        transcribingAnnotations: [],
        title: null,
        type: null,
        useProxy: true
      };
    },

    computed: {
      ...mapGetters({
        apiConfig: 'apis/config'
      }),
      keywords() {
        // Convert collection of annotations' prefLabels into a single langMap
        return this.taggingAnnotations.reduce((memo, annotation) => {
          for (const lang in annotation.body.prefLabel) {
            if (!memo[lang]) memo[lang] = [];
            memo[lang] = memo[lang].concat(annotation.body.prefLabel[lang]);
          }
          return memo;
        }, {});
      },
      fieldsAndKeywords() {
        return { ...this.fields, ...{ keywords: this.keywords } };
      },
      allMetaData() {
        return { ...this.coreFields, ...this.fieldsAndKeywords };
      },
      europeanaAgents() {
        return (this.agents || []).filter((agent) => agent.about.startsWith(`${this.apiConfig.data.origin}/agent/`));
      },
      europeanaConcepts() {
        return (this.concepts || []).filter((concept) => concept.about.startsWith(`${this.apiConfig.data.origin}/concept/`));
      },
      europeanaEntityUris() {
        const entities = this.europeanaConcepts.concat(this.europeanaAgents);
        return entities.map((entity) => entity.about).slice(0, 5);
      },
      titlesInCurrentLanguage() {
        let titles = [];

        const mainTitle = this.title ? langMapValueForLocale(this.title, this.$i18n.locale) : '';
        const alternativeTitle = this.altTitle ? langMapValueForLocale(this.altTitle, this.$i18n.locale) : '';

        const allTitles = [].concat(mainTitle, alternativeTitle).filter(Boolean);
        for (let title of allTitles) {
          for (let value of title.values) {
            titles.push({ 'code': title.code, value });
          }
        }

        return titles;
      },
      descriptionInCurrentLanguage() {
        if (!this.description) {
          return false;
        }
        return langMapValueForLocale(this.description, this.$i18n.locale);
      },
      metaTitle() {
        return this.titlesInCurrentLanguage[0] ? this.titlesInCurrentLanguage[0].value : this.$t('record.record');
      },
      metaDescription() {
        if (!this.descriptionInCurrentLanguage) return '';
        return this.descriptionInCurrentLanguage.values[0] ? this.descriptionInCurrentLanguage.values[0] : '';
      },
      isRichMedia() {
        return isRichMedia(this.selectedMedia);
      },
      selectedMedia: {
        get() {
          return this.selectedMediaItem || this.media[0] || {};
        },
        set(about) {
          this.selectedMediaItem = this.media.find((item) => item.about === about) || {};
        }
      },
      selectedMediaImage() {
        if (!this.selectedMedia.thumbnails) return {};
        return {
          src: this.selectedMedia.thumbnails.large,
          link: this.isShownAt
        };
      },
      displayMediaThumbnailGrid() {
        // TODO: the IIIF Presentation check may need to account for potentially
        //       some media items being in one Presentation manifest, but
        //       others being, say, audio or video.
        return this.media.length > 1 && !isIIIFPresentation(this.selectedMedia);
      },
      edmRights() {
        return this.selectedMedia.webResourceEdmRights ? this.selectedMedia.webResourceEdmRights : this.fields.edmRights;
      },
      rightsStatement() {
        if (this.edmRights) return langMapValueForLocale(this.edmRights, this.$i18n.locale).values[0];
        return false;
      },
      dataProvider() {
        const edmDataProvider = langMapValueForLocale(this.coreFields.edmDataProvider, this.$i18n.locale);

        if (edmDataProvider.values[0].about) {
          return edmDataProvider.values[0];
        }

        return edmDataProvider;
      },
      notificationUrl() {
        return `https://classic.europeana.eu/portal/${this.$i18n.locale}/record${this.identifier}.html?utm_source=new-website&utm_medium=button`;
      },
      redirectNotificationsEnabled() {
        return Boolean(Number(process.env.ENABLE_LINKS_TO_CLASSIC));
      }
    },

    created() {
      this.cardGridClass = this.isRichMedia && 'card-grid-richmedia';
    },

    mounted() {
      if (process.browser) {
        if (localStorage.itemShowExtendedMetadata && JSON.parse(localStorage.itemShowExtendedMetadata)) {
          this.$root.$emit('bv::toggle::collapse', 'extended-metadata');
        }
        this.$gtm.push({
          itemCountry: langMapValueForLocale(this.fields.edmCountry, 'en').values[0],
          itemDataProvider: langMapValueForLocale(this.coreFields.edmDataProvider, 'en').values[0],
          itemProvider: langMapValueForLocale(this.fields.edmProvider, 'en').values[0],
          itemRights: langMapValueForLocale(this.fields.edmRights, 'en').values[0]
        });
      }

      window.addEventListener('message', (msg) => {
        if (msg.data.event === 'updateDownloadLink') {
          this.useProxy = (this.media.some((item) => item.about === msg.data.id));
          this.selectedMedia.about = msg.data.id;
        }
      });
    },

    methods: {
      annotationsByMotivation(motivation) {
        return this.annotations.filter(annotation => annotation.motivation === motivation);
      },

      selectMedia(about) {
        this.selectedMedia = about;
      },

      getSimilarItems() {
        const noSimilarItems = { items: [] };
        if (this.error) return noSimilarItems;

        if (this.$auth.loggedIn) {
          return this.$recommendations.recommend('record', this.identifier)
            .then(recommendResponse => recommendResponse)
            .catch(() => {
              return noSimilarItems;
            });
        }

        const dataSimilarItems = {
          dcSubject: this.getSimilarItemsData(this.coreFields.dcSubject),
          dcType: this.getSimilarItemsData(this.title),
          dcCreator: this.getSimilarItemsData(this.coreFields.dcCreator),
          edmDataProvider: this.getSimilarItemsData(this.fields.edmDataProvider)
        };

        return search({
          query: similarItemsQuery(this.identifier, dataSimilarItems),
          rows: 4,
          profile: 'minimal',
          facet: ''
        }, {
          origin: this.$route.query.recordApi
        })
          .then(response => response)
          .catch(() => {
            return noSimilarItems;
          });
      },

      getSimilarItemsData(value) {
        if (!value) return;

        const data = langMapValueForLocale(value, this.$i18n.locale).values;
        if (!data) return;

        return data.filter(item => typeof item === 'string');
      }
    },

    head() {
      return {
        title: this.metaTitle,
        meta: [
          { hid: 'title', name: 'title', content: this.metaTitle },
          { hid: 'description', name: 'description', content: this.metaDescription },
          { hid: 'og:title', property: 'og:title', content: this.metaTitle },
          { hid: 'og:description', property: 'og:description', content: this.metaDescription },
          { hid: 'og:image', property: 'og:image', content: this.selectedMediaImage.src ? this.selectedMediaImage.src : '' },
          { hid: 'og:type', property: 'og:type', content: 'article' }
        ]
      };
    },

    beforeRouteLeave(to, from, next) {
      this.$gtm.push({
        itemCountry: undefined,
        itemDataProvider: undefined,
        itemProvider: undefined,
        itemRights: undefined
      });
      next();
    }
  };
</script>

<style lang="scss" scoped>
  @import './assets/scss/variables.scss';
  @import './assets/scss/icons.scss';

  h2:not(.related-heading) {
    font-size: $font-size-medium;
    font-weight: bold;
  }

  .bg-grey {
    background-color: rgba(255, 255, 255, 0.5);
  }

  .card-grid {
    display: grid;
    column-gap: 1rem;
    grid-template-columns: [col1-start] 1fr [col2-start] 1fr [col2-end];
    grid-template-rows: [row1-start] auto [row2-start] auto [row3-start] auto [row3-end];
  }

  .card-heading {
    grid-row: row1-start;
    grid-column: col1-start/col2-end;

    @media (min-width: $bp-large) {
      grid-column: col2-start/col2-end;
    }
  }

  .media-presentation {
    grid-row: row3-start;
    grid-column: col1-start/col2-end;

    @media (min-width: $bp-large) {
      grid-column: col1-start/col2-start;
      grid-row: row1-start/row3-end;
    }
  }

  .description {
    grid-column: col1-start/col2-end;
    grid-row: row2-start;

    @media (min-width: $bp-large) {
      grid-column: col2-start/col2-end;
    }
    overflow-wrap: break-word;
  }

  .card-grid-richmedia .card-heading {
    grid-column: col1-start/col2-end;
  }

  .card-grid-richmedia .media-presentation {
    grid-column: col1-start/col2-end;
    grid-row: row2-start;
  }

  .card-grid-richmedia .description {
    grid-column: col1-start/col2-end;
    grid-row: row3-start;
  }

  .meta-data {
    > div:not(:last-child) {
      margin-bottom: 1rem;
    }
  }

  .disclaimer {
    align-items: center;
    border-bottom: 1px solid #e7e7e9;

    &:before {
      @extend .icon-font;
      content: '\e91f';
      color: $blue;
      font-size: 1.5rem;
      line-height: initial;
      margin-right: 0.5rem;
    }
  }
</style>
