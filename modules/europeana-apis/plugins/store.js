import config from './config';

export default ({ store }) => {
  if (store) {
    store.registerModule('apis', {
      namespaced: true,
      state: {
        origin: null
      },
      mutations: {
        setOrigin: (state, value) => {
          state.origin = value;
        }
      },
      getters: {
        config: (state) => {
          return config[state.origin] || config.defaults;
        }
      }
    });
  }
};
