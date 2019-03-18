/**
 * @file Global Vue filters
 * @see {@link https://vuejs.org/v2/guide/filters.html}
 */

import Vue from 'vue';
Vue.filter('localise', val => val.toLocaleString('en'));