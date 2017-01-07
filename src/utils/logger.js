import log4js from 'log4js';

const { config } = global.app;

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(`${config.logs_dir}/koa.log`), 'koa');

export default log4js.getLogger;
