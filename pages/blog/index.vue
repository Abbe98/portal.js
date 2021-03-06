<template>
  <b-container data-qa="blog">
    <ContentHeader
      :title="$t('blog.blog')"
    />
    <b-row class="flex-md-row pb-5">
      <b-col cols="12">
        <b-card-group
          class="card-deck-4-cols"
          deck
          data-qa="blog posts section"
        >
          <ContentCard
            v-for="(post, index) in posts"
            :key="index"
            :title="post.name"
            :url="{ name: 'blog-all', params: { pathMatch: post.identifier } }"
            :image-url="post.primaryImageOfPage && post.primaryImageOfPage.image.url"
            :texts="[post.description]"
            :datetime="post.datePublished"
          />
        </b-card-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <PaginationNav
          v-model="page"
          :limit="perPage"
          :total-results="total"
          :per-page="perPage"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
  import ContentHeader from '../../components/generic/ContentHeader';
  import ContentCard from '../../components/generic/ContentCard';

  const PER_PAGE = 20;

  export default {
    name: 'BlogFoyer',
    components: {
      ContentHeader,
      ContentCard,
      PaginationNav: () => import('../../components/generic/PaginationNav')
    },

    middleware: 'sanitisePageQuery',

    asyncData({ query, error, app, store }) {
      const variables = {
        locale: app.i18n.isoLocale(),
        preview: query.mode === 'preview',
        limit: PER_PAGE,
        skip: (store.state.sanitised.page - 1) * PER_PAGE
      };

      return app.$contentful.query('blogFoyerPage', variables)
        .then(response => response.data.data)
        .then(data => {
          return {
            posts: data.blogPostingCollection.items,
            total: data.blogPostingCollection.total,
            page: store.state.sanitised.page,
            perPage: PER_PAGE
          };
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },

    data() {
      return {
        perPage: PER_PAGE,
        page: null
      };
    },

    head() {
      return {
        title: this.$t('blog.blog')
      };
    },

    watchQuery: ['page']
  };
</script>
