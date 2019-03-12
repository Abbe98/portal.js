import { shallowMount } from '@vue/test-utils';
import MetadataField from '../../../../components/record/MetadataField.vue';

const factory = () => shallowMount(MetadataField);

describe('components/record/MetadataField', () => {
  const props = { name: 'dcCreator', value: { def: 'Artist' } };

  describe('a labeled field', () => {
    const wrapper = factory();

    it('outputs the field label', () => {
      wrapper.setProps(props);

      const fieldName = wrapper.find('[data-qa="metadata field"] [data-qa="label"]');
      fieldName.text().should.eq('Creators');
    });

    describe('a labeled field with a labelling context', () => {
      const props = { name: 'edmRights', value: { def: 'http://rightsstatements.org/vocab/InC/1.0/' }, context: 'webResource' };
      it('outputs the context specific label', () => {

        wrapper.setProps(props);

        const fieldName = wrapper.find('[data-qa="metadata field"] [data-qa="label"]');
        fieldName.text().should.eq('License for this media resource');
      });
    });
  });

  describe('any non labeled field', () => {
    const wrapper = factory();

    it('outputs the field name', () => {
      const props = { name: 'rdfAbout', value: { def: 'Artist' } };

      wrapper.setProps(props);

      const fieldName = wrapper.find('[data-qa="metadata field"] [data-qa="label"]');
      fieldName.text().should.eq('rdfAbout');
    });
  });

  it('outputs the field value in a code block', () => {
    const wrapper = factory();

    wrapper.setProps(props);

    const fieldValue = wrapper.find('[data-qa="metadata field"] [data-qa="value"]');
    fieldValue.text().should.eq(JSON.stringify(props.value, null, 2));
  });
});
