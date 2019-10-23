<template>
  <section class="carousel">
    <div
      class="carousel-inner"
      role="listbox"
    >
      <div
        v-for="(img, index) in fakeimages"
        :key="index"
        class="carousel-item"
        :class="{ 'is-active' : index === isActive }"
      >
        <img :src="img">
      </div>
    </div>

    <div
      ref="thumbnails"
      class="carousel-thumbnails"
      @mousemove="beginDrag"
    >
      <ol
        ref="slider"
        class="carousel-thumbnails-list"
        :class="{ 'is-active' : thumbnailActive }"
      >
        <li
          v-for="(img, index) in fakeimages"
          :key="index"
          :data-slide-to="index"
          :class="{ 'is-active' : index === isActive }"
          @click="isActive = index"
        >
          <img :src="img">
        </li>
      </ol>
    </div>
  </section>
</template>

<script>

  export default {
    name: 'Carousel',

    data() {
      return {
        isActive: 0,
        thumbnailActive: false,
        fakeimages: [
          'https://www.placecage.com/c/460/300',
          'https://www.fillmurray.com/g/460/300',
          'https://www.placecage.com/c/460/300',
          'https://www.fillmurray.com/g/460/300',
          'https://www.placecage.com/c/460/300',
          'https://www.fillmurray.com/g/460/300'
        ]
      };
    },

    methods: {
      beginDrag(event) {
        event.preventDefault();
      }
    }
  };
</script>

<style lang="scss" scoped>
  .carousel {
    position: relative;
    width: 460px;

    &-inner {
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 100%;
      margin-bottom: 10px;
    }

    &-item {
      position: absolute;
      left: 0;
      top: 0;
      width: 150px;
      height: 100%;
      display: block;
      opacity: 0;
      z-index: 0;
      opacity: .5;
      transition: opacity .6s ease;

      &.is-active {
        position: relative;
        z-index: 1;
        opacity: 1;
      }
    }

    &-thumbnails {
      position: relative;
      height: 200px;
    }

    &-thumbnails-list {
      display: flex;
      overflow-x: scroll;
      list-style: none;
      padding: 0 0 4px ;
      transform: scale(0.98);
      width: 100%;

      &::-webkit-scrollbar {
        height: 6px;
      }
      &::-webkit-scrollbar-track {
        border-radius: 10px;
        background: #eaeaea;
      }
      &::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background: #b4b4b4;
      }
      &::-webkit-scrollbar-thumb:window-inactive {
        background: rgba(100, 100, 100, 0.4);
      }

      &.is-active {
        transform: scale(1);
        cursor: grabbing;
        cursor: -webkit-grabbing;
      }

      li {
        flex: 0 1 auto;
        margin-right: 5px;
        margin-left: 5px;
        opacity: .5;
        transition: opacity .6s ease;

        img {
          width: 150px;
        }

        &.is-active {
          opacity: 1;
        }
      }
    }
  }
</style>
