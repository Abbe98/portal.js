<template>
  <div id="uv">
    universal viewer
  </div>
</template>


<script>
  export default {
    mounted: function () {
      console.log('mounted', typeof UV);
      window.addEventListener('uvLoaded', () => {
        console.log('uvLoaded');
      }, false);
    }
  };
</script>
