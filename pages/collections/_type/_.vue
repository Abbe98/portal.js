<template>
  <b-container v-if="error">
    <AlertMessage
      :error="error"
    />
  </b-container>
  <b-container
    v-else
    data-qa="entity page"
  >
    <b-row class="flex-md-row pt-3">
      <b-col
        cols="12"
        md="9"
      >
        <EntityDetails
          :attribution="attribution"
          :depiction="depiction"
          :description="description"
          :is-editorial-description="hasEditorialDescription"
          :title="title"
          :depiction-link-title="depictionLinkTitle"
        />
        <SearchInterface
          class="px-0"
          :per-row="3"
          :per-page="recordsPerPage"
          :route="route"
          :show-content-tier-toggle="false"
        />
      </b-col>
      <b-col
        cols="12"
        md="3"
        class="pb-3"
      >
        <h2
          v-if="relatedEntities.length > 0"
          class="is-size-4 text-uppercase font-weight-bold"
        >
          {{ $t('relatedCollections') }}
        </h2>
        <EntityCards
          v-if="relatedEntities"
          :entities="relatedEntities"
          data-qa="related entities"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <BrowseSections
          v-if="page"
          :sections="page.hasPart"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import axios from 'axios';

  import AlertMessage from '../../../components/generic/AlertMessage';
  import EntityCards from '../../../components/entity/EntityCards';
  import BrowseSections from '../../../components/browse/BrowseSections';
  import EntityDetails from '../../../components/entity/EntityDetails';
  import SearchInterface from '../../../components/search/SearchInterface';

  import { mapState } from 'vuex';

  import * as entities from '../../../plugins/europeana/entity';
  import { pageFromQuery } from '../../../plugins/utils';
  import createClient from '../../../plugins/contentful';
  import { langMapValueForLocale } from  '../../../plugins/europeana/utils';

  export default {
    components: {
      AlertMessage,
      BrowseSections,
      EntityCards,
      EntityDetails,
      SearchInterface
    },
    async middleware({ app, store, query, redirect, params, error }) {
      store.commit('search/disableCollectionFacet');
      const contentfulClient = createClient(query.mode);

      // fetch all curated entity pages
      if (!store.state.entity.curatedEntities) {
        await contentfulClient.getEntries({
          'locale': 'en-GB',
          'content_type': 'entityPage',
          'include': 0,
          'limit': 1000 // 1000 is the maximum number of results returned by contentful
        }).then((response) => {
          const curatedEntities = response.items.reduce((memo, entityPage) => {
            // TODO: store desired path, not name
            memo[entityPage.fields.identifier] = entityPage.fields.name;
            return memo;
          }, {});
          store.commit('entity/setCuratedEntities', curatedEntities);
        }).catch(() => {
          store.commit('entity/setCuratedEntities', []);
        });
      }

      const entityUri = entities.getEntityUri(params.type, params.pathMatch);

      // Fetch entity early as it's needed for getting English prefLabels which
      // are needed for both redirects to preferred path, and best bets
      if (entityUri !== store.state.entity.id) {
        store.commit('entity/setPage', null);
        store.commit('entity/setRelatedEntities', null);
        let entity;
        try {
          entity = await entities.getEntity(params.type, params.pathMatch);
        } catch (err) {
          const statusCode = (typeof err.statusCode !== 'undefined') ? err.statusCode : 500;
          return error({
            message: err.message,
            statusCode
          });
        }
        store.commit('entity/setEntity', entity.entity);
        store.commit('entity/setId', entityUri);
      }

      const entity = store.state.entity.entity;

      const curatedEntityName = store.state.entity.curatedEntities[entityUri];
      const desiredPath = entities.getEntitySlug(entity.id, curatedEntityName || entity.prefLabel.en);

      if (params.pathMatch !== desiredPath) {
        const redirectPath = app.localePath({
          name: 'collections-type-all',
          params: { type: params.type, pathMatch: encodeURIComponent(desiredPath) }
        });
        return redirect(302, redirectPath);
      }

      // TODO: move to global middleware?
      const currentPage = pageFromQuery(query.page);
      if (currentPage === null) {
        // Redirect non-positive integer values for `page` to `page=1`
        return redirect(app.localePath({
          name: 'collections-type-all',
          params: { type: params.type, pathMatch: params.pathMatch },
          query: { page: 1 }
        }));
      }
    },

    data() {
      return {
        entity: null,
        error: null,
        page: null,
        relatedEntities: null
      };
    },

    computed: {
      ...mapState({
        recordsPerPage: state => state.entity.recordsPerPage
      }),
      attribution() {
        if (this.editorialDepiction) return this.editorialAttribution;
        return (!this.entity || !this.entity.depiction) ? null : this.entity.depiction.source;
      },
      depiction() {
        if (this.editorialDepiction) return this.editorialDepiction;
        return (!this.entity || !this.entity.depiction) ? null : entities.getWikimediaThumbnailUrl(this.entity.depiction.id);
      },
      depictionLinkTitle() {
        return this.editorialDepiction ? this.$t('goToRecord') : this.$t('entityDepictionCredit');
      },
      description() {
        return this.editorialDescription ? { values: [this.editorialDescription], code: null } : null;
      },
      descriptionText() {
        return (this.description && this.description.values.length >= 1) ? this.description.values[0] : null;
      },
      editorialAttribution() {
        return this.page.primaryImageOfPage.fields.url;
      },
      // Depiction from the Contentful entry
      editorialDepiction() {
        try {
          const image = this.page.primaryImageOfPage.fields.image.fields.file;
          return this.$options.filters.optimisedImageUrl(image.url, image.contentType, { width: 510 });
        } catch (error) {
          if (error instanceof TypeError) {
            return null;
          }
          throw error;
        }
      },
      // Description from the Contentful entry
      editorialDescription() {
        if (!this.hasEditorialDescription) return null;
        return this.page.description;
      },
      hasEditorialDescription() {
        return this.page && this.page.description && this.page.description.length >= 1;
      },
      // Title from the Contentful entry
      editorialTitle() {
        if (!this.page || !this.page.name) return null;
        return this.page.name;
      },
      route() {
        return {
          name: 'collections-type-all',
          params: {
            type: this.$route.params.type,
            pathMatch: this.$route.params.pathMatch
          }
        };
      },
      title() {
        if (!this.entity) return this.titleFallback(this.$t('entity'));
        if (this.editorialTitle) return this.titleFallback(this.editorialTitle);
        return langMapValueForLocale(this.entity.prefLabel, this.$store.state.i18n.locale);
      }
    },

    asyncData({ query, params, res, app, store }) {
      const entityUri = store.state.entity.entity.id;

      // Prevent re-requesting entity content from APIs if already loaded,
      // e.g. when paginating through entity search results
      if (store.state.entity.entity && store.state.entity.relatedEntities) {
        return {
          entity: store.state.entity.entity,
          page: store.state.entity.page,
          relatedEntities: store.state.entity.relatedEntities
        };
      }

      const contentfulClient = createClient(query.mode);
      const curatedEntityName = store.state.entity.curatedEntities[entityUri];

      return axios.all([
        entities.relatedEntities(params.type, params.pathMatch, { origin: query.recordApi })
      ].concat(!curatedEntityName ? [] : contentfulClient.getEntries({
        'locale': app.i18n.isoLocale(),
        'content_type': 'entityPage',
        'fields.identifier': entityUri,
        'include': 2,
        'limit': 1
      })))
        .then(axios.spread(async(related, entries) => {
          const entityPage = entries && entries.total > 0 ? entries.items[0].fields : null;

          // Store content for reuse should a redirect be needed, below, or when
          // navigating back to this page, e.g. from a search result.
          store.commit('entity/setPage', entityPage);
          store.commit('entity/setRelatedEntities', related);

          return {
            entity: store.state.entity.entity,
            page: entityPage,
            relatedEntities: related
          };
        }))
        .catch((error) => {
          if (typeof res !== 'undefined') {
            res.statusCode = (typeof error.statusCode !== 'undefined') ? error.statusCode : 500;
          }
          return { error: error.message };
        });
    },

    async fetch({ query, store }) {
      await store.dispatch('entity/searchForRecords', query);
    },

    mounted() {
      this.$store.commit('search/setPill', this.title);
    },

    methods: {
      titleFallback(title) {
        return {
          values: [title],
          code: null
        };
      }
    },

    head() {
      return {
        title: this.title.values[0],
        meta: [
          { hid: 'title', name: 'title', content: this.title.values[0] },
          { hid: 'og:title', property: 'og:title', content: this.title.values[0] }
        ].concat(this.descriptionText ? [
          { hid: 'description', name: 'description', content: this.descriptionText },
          { hid: 'og:description', property: 'og:description', content: this.descriptionText }
        ] : [])
      };
    },

    async beforeRouteLeave(to, from, next) {
      await this.$store.dispatch('search/deactivate');
      this.$store.commit('entity/setId', null); // needed to re-enable auto-suggest in header
      this.$store.commit('entity/setEntity', null); // needed for best bets handling
      next();
    },

    watchQuery: ['api', 'reusability', 'query', 'qf', 'page']
  };
</script>