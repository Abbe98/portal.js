import config from './config';

export default ({ app }, inject) => {
  app.$apis = config;
  inject('apis', config);
};
