const contentful = require('contentful');

export default function createClient(mode) {
  // These values will be set via env vars.
  // If this file is imported these values may be available to the client.

  const config = {
    delivery: {
      space: process.env.CTF_SPACE_ID,
      environment: process.env.CTF_ENVIRONMENT_ID || 'master',
      accessToken: process.env.CTF_CDA_ACCESS_TOKEN,
      host: process.env.CTF_CDA_HOST || 'cdn.contentful.com'
    },
    preview: {
      space: process.env.CTF_SPACE_ID,
      environment: process.env.CTF_ENVIRONMENT_ID || 'master',
      accessToken: process.env.CTF_CPA_ACCESS_TOKEN,
      host: 'preview.contentful.com'
    }
  };

  const modeConfig = (mode === 'preview' && process.env.CTF_CPA_ACCESS_TOKEN ? config.preview : config.delivery);
  console.log('modeConfig', modeConfig);
  return contentful.createClient(modeConfig);
}
