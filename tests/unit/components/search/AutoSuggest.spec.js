import { createLocalVue, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import AutoSuggest from '../../../../components/search/AutoSuggest.vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import sinon from 'sinon';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VueRouter);
localVue.use(Vuex);

const router = new VueRouter({
  routes: [
    { name: 'search', path: '/search' }
  ]
});

const routerPush = sinon.spy(router, 'push');
const factory = (options = {}) => {
  return mount(AutoSuggest, {
    localVue,
    attachToDocument: true,
    router: options.router || router,
    mocks: {
      ...{
        $t: () => {},
        localePath: (opts) => {
          return router.resolve(opts).route.fullPath;
        }
      }, ...(options.mocks || {})
    },
    store: options.store || {},
    computed: {
      isDisabled() {
        return false;
      }
    }
  });
};

const getters = {
  'search/activeView': (state) => state.search.view
};
const store = (options = {}) => {
  return new Vuex.Store({
    getters,
    state: options.state || {
      search: {},
      entity: {
        id: null
      },
      i18n: {
        locale: 'en'
      }
    }
  });
};

describe('components/search/AutoSuggest', () => {
  describe('query', () => {
    context('when on a search page', () => {
      const wrapper = factory({
        store: store({
          state: {
            search: {
              active: true,
              query: 'cartography'
            }
          },
          i18n: {
            locale: 'en'
          }
        })
      });

      it('uses stored query', () => {
        wrapper.vm.query.should.eq('cartography');
      });
    });

    context('when not on a search page', () => {
      const wrapper = factory({
        store: store({
          state: {
            search: {
              active: false,
              query: 'cartography'
            },
            i18n: {
              locale: 'en'
            }
          }
        })
      });

      it('is empty', () => {
        wrapper.setData({ isDisabled: false });
        wrapper.vm.query.should.eq('');
      });
    });
  });

  describe('routePath', () => {
    context('when on a search page', () => {
      const wrapper = factory({
        store: store({
          state: {
            search: {
              active: true
            },
            i18n: {
              locale: 'en'
            }
          }
        })
      });

      it('uses current route path', () => {
        wrapper.vm.routePath.should.eq(wrapper.vm.$route.path);
      });
    });

    context('when not on a search page', () => {
      const wrapper = factory({
        store: store({
          state: {
            search: {
              active: false
            },
            i18n: {
              locale: 'en'
            }
          }
        })
      });

      it('uses default search route path', () => {
        wrapper.vm.routePath.should.eql('/search');
      });
    });
  });

  describe('form submission', () => {
    const inputQueryAndSubmitForm = (wrapper, query) => {
      const form =  wrapper.find('form');
      const queryInputField = form.find('input[type="text"]');
      queryInputField.setValue(query);
      form.trigger('submit.prevent');
    };

    const newQuery = 'trees';

    context('when on a search page', () => {
      const state = {
        search: {
          active: true,
          query: '',
          view: 'grid'
        },
        i18n: {
          locale: 'en'
        }
      };
      const wrapper = factory({
        store: store({
          state
        })
      });

      it('updates current route', async() => {
        await inputQueryAndSubmitForm(wrapper, newQuery);

        const newRouteParams = {
          path: wrapper.vm.$route.path,
          query: { query: newQuery, page: 1, view: state.search.view }
        };
        routerPush.should.have.been.calledWith(newRouteParams);
      });
    });

    context('when not on a search page', () => {
      const state = {
        search: {
          active: false,
          query: '',
          view: 'list'
        },
        i18n: {
          locale: 'en'
        }
      };
      const wrapper = factory({
        store: store({
          state
        })
      });

      it('reroutes to search', async() => {
        await inputQueryAndSubmitForm(wrapper, newQuery);

        const newRouteParams = {
          path: '/search',
          query: { query: newQuery, page: 1, view: state.search.view }
        };
        routerPush.should.have.been.calledWith(newRouteParams);
      });
    });
  });

  describe('auto suggestion', async() => {
    const wrapper = factory({
      store: store({
        state: {
          search: {
            active: false,
            query: ''
          },
          i18n: {
            locale: 'en'
          }
        }
      })
    });
    const getSuggestions = sinon.spy(wrapper.vm, 'getSuggestions');
    const searchBox = wrapper.find('[data-qa="search box"]');

    it('call `getSuggestions` method when user types into search box', () => {
      wrapper.setData({ query: 'World' });
      searchBox.trigger('input');

      getSuggestions.should.have.callCount(1);

    });

    it('disables autosuggestion if user is on `entity` page', () => {
      const wrapper = factory({
        store: store({
          state: {
            search: {
              active: false,
              query: ''
            },
            entity: {
              id: 'ghghghghg'
            },
            i18n: {
              locale: 'en'
            }
          }
        })
      });

      wrapper.setData({ query: 'World' });
      wrapper.vm.getSuggestions();
      wrapper.vm.options.should.eql({});
    });

    it('returns zero options when there are less than 3 characters in search form', () => {
      wrapper.setData({ query: 'Wo' });
      wrapper.vm.getSuggestions();

      wrapper.vm.options.should.eql({});
    });

    it('returns options when there are 3 or more characters in search form', async() => {
      wrapper.setData({ query: 'World' });
      await wrapper.vm.getSuggestions();

      wrapper.vm.options.should.eql({
        '/en/entity/topic/83': {
          'en': 'World War I',
          'fr': 'Première Guerre mondiale'
        },
        '/en/entity/topic/94': {
          'en': 'Architecture',
          'fr': 'Architecture'
        }
      });
    });

    it('highlights matching characters', async() => {
      const wrapper = factory({
        store: store({
          state: {
            i18n: {
              locale: 'en'
            },
            search: {
              active: false
            }
          }
        })
      });
      let suggestion;
      wrapper.setData({ query: 'world' });
      await wrapper.vm.getSuggestions();
      suggestion = wrapper.find('[data-qa="search suggestion world war i link"]');

      wrapper.setData({ query: 'World' });
      suggestion.find('[data-qa="highlighted"]').text().should.eq('World');
      wrapper.setData({ query: 'WORLD' });
      suggestion.find('[data-qa="highlighted"]').text().should.eq('World');
      wrapper.setData({ query: 'Wor' });
      suggestion.find('[data-qa="highlighted"]').text().should.eq('Wor');
      suggestion.find('[data-qa="base"]').text().should.eq('ld War I');
    });

    it('allows the user to navigate through suggestions using keyboards up and down arrows', async() => {
      wrapper.setData({ query: 'World' });
      await wrapper.vm.getSuggestions();
      wrapper.trigger('keyup.down');
      wrapper.vm.focus.should.eq(0);
      wrapper.trigger('keyup.down');
      wrapper.vm.focus.should.eq(1);
      wrapper.trigger('keyup.up');
      wrapper.vm.focus.should.eq(0);
    });
  });
});