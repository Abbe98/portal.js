<template>
  <div
    data-qa="account page"
    class="mt-n3"
  >
    <b-container fluid>
      <b-row class="bg-white">
        <b-col class="pt-5 pb-4">
          <h1 class="text-center mb-1">
            @{{ loggedInUser.preferred_username }}
          </h1>
        </b-col>
      </b-row>
      <b-row>
        <b-col class="p-0">
          <b-tabs
            align="center"
            class="mb-3"
          >
            <b-tab
              data-qa="likes collection"
              :title="$t('account.likes')"
              active
            >
              <b-container>
                <b-row class="flex-md-row">
                  <b-col cols="12">
                    <div
                      v-if="$fetchState.pending"
                      class="text-center pb-4"
                    >
                      <LoadingSpinner />
                    </div>
                    <AlertMessage
                      v-else-if="$fetchState.error"
                      :error="$fetchState.error.message"
                    />
                    <template
                      v-else
                    >
                      <div
                        v-if="!likedItems || likedItems.length === 0"
                        class="text-center pb-4"
                      >
                        {{ $t('account.notifications.noLikedItems') }}
                      </div>
                      <ItemPreviewCardGroup
                        v-else
                        v-model="likedItems"
                        class="pb-5"
                      />
                    </template>
                  </b-col>
                </b-row>
              </b-container>
            </b-tab>
            <b-tab
              data-qa="public collections"
              :title="$t('account.publicCollections')"
            >
              <client-only>
                <UserSets
                  visibility="public"
                  data-qa="public sets"
                />
              </client-only>
            </b-tab>
            <b-tab
              data-qa="private collections"
              :title="$t('account.privateCollections')"
            >
              <client-only>
                <UserSets
                  visibility="private"
                  data-qa="private sets"
                />
              </client-only>
            </b-tab>
          </b-tabs>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import { mapState } from 'vuex';

  import ItemPreviewCardGroup from '../../components/item/ItemPreviewCardGroup';
  import UserSets from '../../components/account/UserSets';
  import AlertMessage from '../../components/generic/AlertMessage';
  import LoadingSpinner from '../../components/generic/LoadingSpinner';

  export default {
    middleware: 'auth',

    components: {
      ItemPreviewCardGroup,
      UserSets,
      AlertMessage,
      LoadingSpinner
    },

    fetch() {
      this.fetchLikes();
      this.$store.dispatch('set/fetchCreations');
    },

    fetchOnServer: false,

    data() {
      return {
        loggedInUser: this.$store.state.auth.user
      };
    },

    computed: {
      ...mapState({
        likesId: state => state.set.likesId,
        likedItems: state => state.set.likedItems
      })
    },

    watch: {
      likesId: 'fetchLikes'
    },

    methods: {
      fetchLikes() {
        this.$store.dispatch('set/fetchLikes');
      }
    },

    head() {
      return {
        title: this.$t('account.title')
      };
    }
  };

</script>

<style>
  .nav-tabs {
    margin-bottom: 40px;
  }
</style>
