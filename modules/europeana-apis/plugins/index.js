// import defaultConfig from '~/europeana-apis';
//
// export let config = defaultConfig;
//
// export default ({ store }) => {
//   if (store && store.getters['apis/config']) config = store.getters['apis/config'];
// };

const apis = {
  annotation: require('./annotation.js'),
}

export default ({ app }, inject) => {
  app.$apis = apis;
  inject('apis', apis);
};
