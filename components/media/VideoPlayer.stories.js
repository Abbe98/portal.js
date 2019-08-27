import { storiesOf } from '@storybook/vue';

import VideoPlayer from './VideoPlayer.vue';

storiesOf('Media/Video Player', module)
  .add('WebM video', () => ({
    components: {
      VideoPlayer
    },
    data() {
      return {
        src: 'http://rs.kystreise.no/filestore/5/0/1/9_325fd46a56fb430/5019_alt_1773_d79cc2c9d9c9b45.webm',
        type: 'video/webm'
      };
    },
    template: `
      <b-containerb class="mt-3">
        <VideoPlayer
          :src="src"
          :type="type"
        />
      </b-container>
    `
  }))
  .add('MP4 video', () => ({
    components: {
      VideoPlayer
    },
    data() {
      return {
        src: 'https://europeana1914-1918.s3.amazonaws.com/attachments/236696/9555.236696.original.mp4',
        type: 'video/mp4'
      };
    },
    template: `
      <b-containerb class="mt-3">
        <VideoPlayer
          :src="src"
          :type="type"
        />
      </b-container>
    `
  }));