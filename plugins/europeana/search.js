/**
 * @file Interface to Europeana Record Search API
 */

import axios from 'axios';

function genericThumbnail(edmType) {
  return `https://api.europeana.eu/api/v2/thumbnail-by-url.json?size=w200&uri=&type=${edmType}`;
}

/**
 * Extract the value to display for a field
 * @param {Object} field language map field from API response
 * @return {?(Object|String)} value to display
 */
function display(field) {
  if (!field) {
    return null;
  }

  let value;
  if (field.eng) {
    value = field.eng;
  } else if (field.en) {
    value = field.en;
  } else if (field.def) {
    value = field.def;
  } else if (Object.keys(field).length === 1) {
    value = field[Object.keys(field)[0]];
  } else {
    return field;
  }

  value = [...new Set(value)]; // remove duplicates
  // Remove URIs, but only if other values exist
  const withoutUris = value.filter((element) => {
    return !element.startsWith('http://') && !element.startsWith('https://');
  });
  if (withoutUris.length > 0) {
    value = withoutUris;
  }

  return value;
}

/**
 * Construct fields to display for one search result
 * @param {Object} item individual item returned by the API
 * @return {Object} fields to display for this item
 */
function fieldsForSearchResult(item) {
  let fields = {
    // TODO: fallback to description when API returns dcDescriptionLangAware
    dcTitle: item.dcTitleLangAware ? display(item.dcTitleLangAware) : `No title provided for record ID ${item.id}`,
    // TODO: enable when API returns dcDescriptionLangAware
    // dcDescription: item.dcDescriptionLangAware,
    edmDataProvider: item.dataProvider
  };

  const dcCreator = display(item.dcCreatorLangAware);
  if (dcCreator) {
    fields.dcCreator = dcCreator;
  }

  return fields;
}

/**
 * Extract search results from API response
 * @param  {Object} response API response
 * @return {Object[]} search results
 */
function resultsFromApiResponse(response) {
  const items = response.data.items;

  const results = items.map(item => {
    return {
      europeanaId: item.id,
      edmPreview: item.edmPreview ? `${item.edmPreview[0]}&size=w200` : genericThumbnail(item.type),
      linkTo: `record${item.id}`,
      fields: fieldsForSearchResult(item)
    };
  });

  return results;
}

/**
 * A search response facet.
 *
 * The object is keyed by field label with item count as value.
 *
 * For example:
 * ```
 * {
 *   IMAGE: 33371202,
 *   TEXT: 22845674,
 *   VIDEO: 1137194,
 *   SOUND: 699155,
 *   '3D': 28460
 * }
 * ```
 * @typedef {Object.<string, number>} Facet
 */

/**
 * A set of search response facets.
 *
 * The object is keyed by the facet name.
 *
 * For example:
 * ```
 * {
 *   TYPE: {
 *     IMAGE: 10
 *   }
 * }
 * ```
 * @typedef {Object.<string, Facet>} FacetSet
 */

/**
 * Extract facets from API response
 * @param  {Object} response API response
 * @return {FacetSet} facets
 */
function facetsFromApiResponse(response) {
  if (!response.data.facets) {
    return null;
  }
  const responseFacets = response.data.facets;

  let facets = {};
  for (let responseFacet of responseFacets) {
    let facetFields = {};
    for (let responseFacetField of responseFacet.fields) {
      facetFields[responseFacetField.label] = responseFacetField.count;
    }
    facets[responseFacet.name] = facetFields;
  }

  return facets;
}

/**
 * Page to request from API based on URL query parameter
 * If parameter is not present, returns default of page 1.
 * If parameter is present, and represents a positive integer, return it
 * typecast to Number.
 * Otherwise, parameter is invalid for page number, and return `null`.
 * @param {string} queryPage `page` query parameter from URL
 * @return {?number}
 */
export function pageFromQuery(queryPage) {
  if (queryPage) {
    if (/^[1-9]\d*$/.test(queryPage)) {
      return Number(queryPage);
    } else {
      return null;
    }
  } else {
    return 1;
  }
}

/**
 * Search Europeana Record API
 * @param {Object} params parameters for search query
 * @param {number} params.page page of results to retrieve
 * @param {string} params.query search query
 * @param {string} params.wskey API key
 * @return {{results: Object[], totalResults: number, facets: FacetSet, error: string}} search results for display
 */
function search(params) {
  const maxResults = 1000;
  const perPage = 24;
  const page = params.page || 1;

  const start = ((page - 1) * perPage) + 1;
  const rows = Math.max(0, Math.min(maxResults + 1 - start, perPage));

  return axios.get('https://api.europeana.eu/api/v2/search.json', {
    params: {
      profile: 'minimal,facets',
      facet: 'TYPE',
      query: params.query == '' ? '*:*' : params.query,
      rows: rows,
      start: start,
      wskey: params.wskey
    }
  })
    .then((response) => {
      return {
        error: null,
        results: resultsFromApiResponse(response),
        facets: facetsFromApiResponse(response),
        totalResults: response.data.totalResults
      };
    })
    .catch((error) => {
      const message = error.response ? error.response.data.error : error.message;
      throw new Error(message);
    });
}

export default search;
