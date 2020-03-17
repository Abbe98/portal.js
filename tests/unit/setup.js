// require('dotenv').config({ path: '/home/rwdit/dev/euf/git/portal.js/.env' });
console.log(process.env);
process.exit;
const chai = require('chai');

chai.use(require('chai-as-promised'));
chai.use(require('chai-string'));
chai.use(require('sinon-chai'));

chai.should();
global.should = chai.should;

import('../../plugins/contentful');

import('../../plugins/vue-filters');
