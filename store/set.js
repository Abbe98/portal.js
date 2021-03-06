export const state = () => ({
  likesId: null,
  likedItems: [],
  likedItemIds: [],
  active: null,
  creations: []
});

export const mutations = {
  setLikesId(state, value) {
    state.likesId = value;
  },
  setLikedItems(state, value) {
    state.likedItems = value;
    state.likedItemIds = value.map(item => item.id);
  },
  like(state, itemId) {
    state.likedItemIds.push(itemId);
  },
  unlike(state, itemId) {
    state.likedItemIds.splice(state.likedItemIds.indexOf(itemId), 1);
  },
  setActive(state, value) {
    state.active = value;
  },
  addItemToActive(state, item) {
    state.active.items.push(item);
  },
  setCreations(state, value) {
    state.creations = value;
  }
};

export const getters = {
  isLiked: (state) => (itemId) => {
    return state.likedItemIds.includes(itemId);
  }
};

export const actions = {
  reset({ commit }) {
    commit('setLikesId', null);
    commit('setLikedItems', []);
    commit('setCreations', []);
  },
  like({ commit, state }, itemId) {
    return this.$sets.modifyItems('add', state.likesId, itemId)
      .then(commit('like', itemId));
  },
  unlike({ commit, state }, itemId) {
    return this.$sets.modifyItems('delete', state.likesId, itemId)
      .then(commit('unlike', itemId));
  },
  addItem({ state, dispatch }, { setId, itemId }) {
    return this.$sets.modifyItems('add', setId, itemId)
      .then(() => {
        if (state.active && setId === state.active.id) dispatch('fetchActive', setId);
        dispatch('refreshCreation', setId);
      });
  },
  removeItem({ state, dispatch }, { setId, itemId }) {
    return this.$sets.modifyItems('delete', setId, itemId)
      .then(() => {
        if (state.active && setId === state.active.id) dispatch('fetchActive', setId);
        dispatch('refreshCreation', setId);
      });
  },
  setLikes({ commit }) {
    return this.$sets.getLikes(this.$auth.user ? this.$auth.user.sub : null)
      .then(likesId => commit('setLikesId', likesId));
  },
  createLikes({ commit }) {
    return this.$sets.createLikes()
      .then(response => commit('setLikesId', response.id));
  },
  fetchLikes({ commit, state }) {
    if (!state.likesId) return;

    return this.$sets.getSet(state.likesId, {
      pageSize: 100,
      profile: 'itemDescriptions'
    })
      .then(likes => commit('setLikedItems', likes.items));
  },
  fetchActive({ commit }, setId) {
    return this.$sets.getSet(setId, {
      profile: 'itemDescriptions'
    })
      .then(set => commit('setActive', set));
  },
  createSet({ dispatch }, body) {
    return this.$sets.createSet(body)
      .then(dispatch('fetchCreations'));
  },
  updateSet({ state, commit }, { id, body }) {
    return this.$sets.updateSet(id, body)
      .then(response => {
        if (state.active && id === state.active.id) commit('setActive', { items: state.active.items, ...response });
      });
  },
  deleteSet({ state, commit }, setId) {
    return this.$sets.deleteSet(setId)
      .then(() => {
        if (state.active && setId === state.active.id) commit('setActive', null);
      });
  },
  refreshCreation({ state, commit }, setId) {
    const setToReplaceIndex = state.creations.findIndex(set => set.id === setId);
    if (setToReplaceIndex === -1) return;

    return this.$sets.getSet(setId, {
      profile: 'itemDescriptions'
    })
      .then(set => {
        const creations = [].concat(state.creations);
        creations[setToReplaceIndex] = set;
        commit('setCreations', creations);
      });
  },
  fetchCreations({ commit }) {
    const creatorId = this.$auth.user ? this.$auth.user.sub : null;
    const searchParams = {
      query: `creator:${creatorId}`,
      profile: 'itemDescriptions',
      pageSize: 100 // TODO: pagination?
    };

    return this.$sets.search(searchParams)
      .then(searchResponse => commit('setCreations', searchResponse.data.items || []));
  }
};
