<template>
  <div>
    <div id="tify" />
  </div>
</template>

<script>
  export default {
    layout: 'minimal',

    data() {
      return {
        TIFY_BUILD_PATH: 'https://unpkg.com/tify@0.21.2/dist'
      };
    },

    head() {
      return {
        title: 'IIIF',

        script: [
          { src: `${this.TIFY_BUILD_PATH}/tify.js`, body: true }
        ],

        link: [
          { rel: 'stylesheet', href: `${this.TIFY_BUILD_PATH}/tify.css` }
        ]
      };
    }
  };
</script>

<style lang="scss" scoped>
  #tify {
    width: 100%;
    height: 100%;
    position: fixed;
  }
</style>
