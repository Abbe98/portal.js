import { storiesOf } from '@storybook/vue';
import Carousel from './Carousel.vue';

storiesOf('Generic', module)
  .add('Carousel', () => ({
    components: { Carousel },
    data() {
      return {};
    },
    template: `
      <b-container class="mt-3">
        <Carousel />
      </b-container>`
  }));
