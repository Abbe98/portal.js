import { createLocalVue, shallowMount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import SmartLink from '../../../../components/generic/SmartLink.vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const factory = () => shallowMount(SmartLink, {
  localVue
});

describe('components/generic/SmartLink', () => {
  context('when passed a URL', () => {
    it('should render a link to the site', () => {
      const wrapper = factory();
      wrapper.setProps({ destination: 'https://www.example.org/url-example' });

      wrapper.contains('b-link-stub').should.be.true;
      wrapper.find('b-link-stub').attributes('href').should.exist;
    });
  });

  context('when passed a URL path', () => {
    it('should render a Nuxt link', () => {
      const wrapper = factory();
      wrapper.setProps({ destination: '/url/path-example' });

      wrapper.contains('b-link-stub').should.be.true;
      wrapper.find('b-link-stub').attributes('to').should.exist;
    });
  });

  context('with a named route object', () => {
    it('should render a Nuxt link', () => {
      const wrapper = factory();
      wrapper.setProps({ destination: { name: 'route-to-somewhere' } });

      wrapper.contains('b-link-stub').should.be.true;
      wrapper.find('b-link-stub').attributes('to').should.exist;
    });
  });
});