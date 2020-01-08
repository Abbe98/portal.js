/**
 * @file Global Vue filters
 * @see {@link https://vuejs.org/v2/guide/filters.html}
 */

import Vue from 'vue';
// TODO: remove this when the issue noted in the url plugin is resolved upstream
import { URL } from './url';

Vue.filter('localise', val => {
  if (typeof val === 'undefined' || val === null) {
    return val;
  }
  return val.toLocaleString('en');
});

Vue.filter('truncate', (val, char, ellipsis) => {
  if (!val) return null;
  return val.length > char ? val.substring(0, char) + ellipsis : val;
});

Vue.filter('optimisedImageUrl', (imageUrl, contentType, options = {}) => {
  let imageQueryParams = [];

  const hostnameMatch = imageUrl.match(/\/\/([^/]+)\//);

  if (hostnameMatch) {
    switch (hostnameMatch[1]) {
      case 'images.ctfassets.net':
        if (typeof contentType === 'string' && contentType === 'image/jpeg')
          imageQueryParams.push('fm=jpg&fl=progressive&q=50');

        if (options.width) imageQueryParams.push(`w=${options.width}`);
        if (options.height) imageQueryParams.push(`h=${options.height}`);

        if (imageQueryParams.length > 0) imageUrl += '?' + imageQueryParams.join('&');
        break;
      case 'api.europeana.eu':
        //imageUrl = imageUrl.replace('api.europeana.eu', 'api-acc.eanadev.org');
        imageUrl = imageUrl.replace('api.europeana.eu', 'api-acc.europeana.eu')
          .replace('/api/v2/thumbnail-by-url.json', '/cdn-cgi/image/format=auto,quality=70/api/v2/thumbnail-by-url.json');
        break;
    }
  }

  return imageUrl;
});

/**
 * Convert new lines to <br/>
 * @param {string} val text value
 * @return {String} text value with HTML breaks
 */

Vue.filter('convertNewLine', (val) => {
  return val.replace(/\n/g, '<br/>');
});

Vue.filter('proxyMedia', (mediaUrl, europeanaId) => {
  const proxyUrl = new URL('https://proxy.europeana.eu');
  proxyUrl.pathname = europeanaId;
  proxyUrl.searchParams.append('view', mediaUrl);
  return proxyUrl.toString();
});
