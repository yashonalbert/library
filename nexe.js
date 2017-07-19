/* eslint-disable import/newline-after-import */

process.env.WorkPath = process.cwd();

const { default: config } = require('./lib/utils/config');
const { default: server } = require('./lib/server');

server.listen(config.port, () => console.info(`szlibrary listening on port ${config.port}`));
