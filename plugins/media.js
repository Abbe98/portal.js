import { oEmbeddable } from './oembed.js';

export function isPDF(media) {
  return media.ebucoreHasMimeType === 'application/pdf';
}

export function isHTMLVideo(media) {
  return ['video/ogg', 'video/webm'].includes(media.ebucoreHasMimeType) ||
    ((media.ebucoreHasMimeType === 'video/mp4') && (media.edmCodecName === 'h264'));
}

export function isHTMLAudio(media) {
  return ['audio/flac', 'audio/ogg', 'audio/mpeg'].includes(media.ebucoreHasMimeType);
}

export function isOEmbed(media) {
  return oEmbeddable(media.about);
}

export function isRichMedia(media, options = {}) {
  return isOEmbed(media) || isHTMLVideo(media) || isHTMLAudio(media) ||
    (options.iiif && isIIIFMedia(media));
}
