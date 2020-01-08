<template>
  <b-link
    v-if="link && src"
    :href="link"
    target="_blank"
  >
    <b-img-lazy
      :src="src | optimisedImageUrl"
      class="mw-100"
      alt=""
      data-qa="media preview image"
    />
  </b-link>
  <b-img-lazy
    v-else-if="!link && src"
    :src="src | optimisedImageUrl"
    alt=""
    class="mw-100"
    data-qa="media preview image"
  />
</template>

<script>
  export default {
    name: 'MediaImage',

    props: {
      link: {
        type: String,
        default: ''
      },
      src: {
        type: String,
        default: ''
      }
    }
  };
</script>
