// Add a function that takes a `media` object and returns:
// 1. IIIF Presentation manifest URI(s). Nothing more.
// Have the media presentation component only import and use this function as
// it's only interested in IIIF Presentations.

function serviceConformsToIIIFImageAPI(service = {}) {
  return (service.dctermsConformsTo || []).includes('http://iiif.io/api/image');
}

export function isIIIFMedia(media) {
  return (media.services || []).some((service) => serviceConformsToIIIFImageAPI(service));
}

export function isIIIFImage(media) {
  return isIIIFMedia(media) &&
    (((media.dctermsIsReferencedBy || []).length === 0) || iiifReferenceIsImageInfo(media));
}

function iiifReferenceIsImageInfo(media) {
  return iiifImageInformationRequestUri(media.services[0].about) === media.dctermsIsReferencedBy[0];
}

export function isIIIFPresentation(media) {
  if (!isIIIFMedia(media) || ((media.dctermsIsReferencedBy || []).length === 0)) return false;

  return !iiifReferenceIsImageInfo(media);
}

// https://iiif.io/api/image/2.1/#image-information-request-uri-syntax
export function iiifImageInformationRequestUri(imageUri) {
  return `${imageUri}/info.json`;
}

export function iiifPresentationManifestUri(media, europeanaIdentifier) {
  if (isIIIFPresentation(media)) {
    return media.dctermsIsReferencedBy[0];
  }

  return `https://iiif.europeana.eu/presentation${europeanaIdentifier}/manifest`;
}
