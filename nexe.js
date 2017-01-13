/* eslint-disable import/newline-after-import */

process.env.WorkPath = __dirname;

const { default: config } = require('./lib/utils/config');
const { default: server } = require('./lib/server');

server.listen(config.port);
