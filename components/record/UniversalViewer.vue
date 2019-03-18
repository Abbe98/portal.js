<template>
  <div ref="uv">
    universal viewer
  </div>
</template>


<script>
  let uvPlayer;
  export default {
    mounted: function () {
      console.log('mounted', uvPlayer);
      let urlDataProvider = new window.UV.URLDataProvider(true);
      console.log(urlDataProvider);

      uvPlayer = window.createUV(this.$refs['uv'], {
        iiifResourceUri: 'https://iiif.europeana.eu/presentation/9200396/BibliographicResource_3000118435009/manifest'
      });
    }
  };
</script>
