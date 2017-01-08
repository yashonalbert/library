/* eslint-disable import/newline-after-import */

global.Promise = require('bluebird');
const { getConfig } = require('./config');

const app = global.app = { config: getConfig(__dirname) };

const { default: server } = require('./lib/server');
server.listen(app.config.port);

app.server = server;
