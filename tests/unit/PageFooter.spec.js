import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import PageFooter from '../../components/PageFooter.vue';

const factory = () => shallowMount(PageFooter);

describe('PageFooter', () => {
  it('it exists', () => {
    const wrapper = factory();

    let footer = wrapper.find('footer');

    expect(footer).to.exist;
  });
});
