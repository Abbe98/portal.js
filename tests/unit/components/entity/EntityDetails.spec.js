import { createLocalVue, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';

import EntityDetails from '../../../../components/entity/EntityDetails.vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const $route = {
  fullPath: '/entity/topic/94-architecture'
};

const $i18n = {
  locales: [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' }
  ],
  locale: 'en'
};

const factory = () => mount(EntityDetails, {
  localVue,
  mocks: {
    $route,
    $t: () => {},
    $i18n,
    localePath: () => {}
  }
});

const entityDetails = { description: 'Architecture is both the process and the product of planning, designing, and constructing buildings and other physical structures.',
  attribution: 'http://commons.wikimedia.org/wiki/Special:FilePath/View_of_Santa_Maria_del_Fiore_in_Florence.jpg',
  depiction: 'https://commons.wikimedia.org/wiki/File:View_of_Santa_Maria_del_Fiore_in_Florence.jpg'
};

describe('components/browse/EntityDetails', () => {
  it('shows a description, attribution and depiction', () => {
    const wrapper = factory();
    wrapper.setProps(entityDetails);
    wrapper.setData({ depictionThumbnail: entityDetails.depiction });

    wrapper.find('img').attributes('src').should.eq(entityDetails.depiction);
    wrapper.find('a[data-qa="entity attribution"]').attributes('href').should.eq(entityDetails.attribution);
    wrapper.text().should.contain(entityDetails.description);
  });

  it('shows a description only', () => {
    const wrapper = factory();
    wrapper.setProps({ 'description': entityDetails.description });

    wrapper.findAll('img').length.should.eq(0);
    wrapper.findAll('a[data-qa="entity attribution"]').length.should.eq(0);
    wrapper.text().should.contain(entityDetails.description);
  });

  it('shows a depiction only', () => {
    const wrapper = factory();
    wrapper.setProps({ 'depiction': entityDetails.depiction, 'attribution': entityDetails.attribution });
    wrapper.setData({ depictionThumbnail: entityDetails.depiction });

    wrapper.findAll('img').length.should.eq(1);
    wrapper.text().should.not.contain(entityDetails.description);
  });

  it('does not show a show more link', () => {
    const wrapper = factory();
    wrapper.setProps(entityDetails);
    wrapper.setData({ depictionThumbnail: entityDetails.depiction });

    wrapper.findAll('a[data-qa="entity show link"]').length.should.eq(0);
  });

  it('shows a show more link', () => {
    const wrapper = factory();
    wrapper.setProps(entityDetails);
    wrapper.setProps({ description: entityDetails.description + entityDetails.description + entityDetails.description });
    wrapper.setData({ depictionThumbnail: entityDetails.depiction });

    wrapper.findAll('a[data-qa="entity show link"]').length.should.eq(1);
  });
});