<template>
  <b-modal
    :id="modalId"
    :title="$t('set.actions.addTo')"
    hide-footer
    hide-header-close
    @show="fetchCollections"
  >
    <b-button
      variant="primary"
      class="btn-collection w-100 mb-3 text-left"
      @click="$emit('clickCreateSet')"
    >
      {{ $t('set.actions.createNew') }}
    </b-button>
    <div class="collections">
      <b-button
        v-for="(collection, index) in collections"
        :key="index"
        :style="buttonBackground($sets.getSetThumbnail(collection))"
        variant="overlay"
        class="btn-collection w-100 text-left d-flex justify-content-between align-items-center"
        @click="toggleItem(collection.id)"
      >
        <span>{{ displayField(collection, 'title') }} ({{ collection.visibility }}) - {{ $tc('items.itemCount', collection.total || 0) }}</span>
        <span
          v-if="collectionsWithItem.includes(collection.id)"
          class="icon-check_circle d-inline-flex"
        />
      </b-button>
    </div>
    <div class="modal-footer">
      <b-button
        variant="outline-primary"
        @click="hideModal()"
      >
        {{ $t('actions.close') }}
      </b-button>
    </div>
  </b-modal>
</template>

<script>
  export default {
    name: 'AddItemToSetModal',

    props: {
      itemId: {
        type: String,
        required: true
      },

      modalId: {
        type: String,
        default: 'add-item-to-set-modal'
      }
    },

    computed: {
      collections() {
        return this.$store.state.set.creations;
      },
      // Array of IDs of sets containing the item
      collectionsWithItem() {
        return this.collections
          .filter(collection => (collection.items || []).some(item => item.id === this.itemId))
          .map(collection => collection.id);
      }
    },

    mounted() {
      this.$root.$on('bv::modal::hidden', () => {
        this.showForm = false;
      });
    },

    methods: {
      fetchCollections() {
        this.$store.dispatch('set/fetchCreations');
      },

      hideModal() {
        this.$nextTick(() => {
          this.$bvModal.hide(this.modalId);
        });
      },

      makeToast() {
        this.$root.$bvToast.toast(this.$t('set.notifications.itemAdded'), {
          toastClass: 'brand-toast',
          toaster: 'b-toaster-bottom-left',
          autoHideDelay: 5000,
          isStatus: true,
          noCloseButton: true,
          solid: true
        });
      },

      toggleItem(setId) {
        if (this.collectionsWithItem.includes(setId)) {
          this.removeItem(setId);
        } else {
          this.addItem(setId);
        }
      },

      addItem(setId) {
        // TODO: error handling
        this.$store.dispatch('set/addItem', { setId, itemId: this.itemId })
          .then(() => {
            this.makeToast();
            this.hideModal();
          });
      },

      removeItem(setId) {
        this.$store.dispatch('set/removeItem', { setId, itemId: this.itemId });
      },

      // TODO: use lang map l10n function
      displayField(set, field) {
        if (!set[field]) {
          return '';
        } else if (set[field][this.$i18n.locale]) {
          return set[field][this.$i18n.locale];
        } else {
          return set[field]['en'];
        }
      },

      buttonBackground(img) {
        if (!img) return null;
        return {
          'background-image': `url("${img}")`
        };
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import './assets/scss/variables.scss';

  .btn-collection {
    border: 0;
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    padding: 1rem;
    position: relative;
    text-transform: none;
  }

  .collections {
    max-height: calc(100vh - 474px);
    overflow: auto;

    .btn-collection:last-child {
      margin-bottom: 0;
    }
  }
</style>
