const path = require('path');

const MODULE_NAME = 'europeana-apis';
const PLUGINS = ['index', 'store'];

const config = require(path.resolve(__dirname, 'helpers', 'config.js'));

const nuxtModule = function() {
  this.addTemplate({
    src: path.resolve(__dirname, 'templates', 'config.js'),
    fileName: path.join(MODULE_NAME, 'config.js'),
    options: config
  });

  for (const plugin of PLUGINS) {
    this.addPlugin({
      src: path.resolve(__dirname, 'plugins', `${plugin}.js`),
      fileName: path.join(MODULE_NAME, `plugin.${plugin}.js`)
    });
  }

  this.addServerMiddleware(path.resolve(__dirname, 'middlewares', 'server-middleware.js'));
};

export {
  nuxtModule as default,
  annotation: require(path.resolve(__dirname, ''))
};
