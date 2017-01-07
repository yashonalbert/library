import log4js from 'log4js';

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/koa.log'), 'koa');

export default log4js.getLogger;
