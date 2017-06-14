import log4js from 'log4js';
import config from './config';

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(`${config.logs_dir}/koa.log`), 'koa');
log4js.addAppender(log4js.appenders.file(`${config.logs_dir}/api.log`), 'api');
log4js.addAppender(log4js.appenders.file(`${config.logs_dir}/schedule.log`), 'schedule');
log4js.addAppender(log4js.appenders.file(`${config.logs_dir}/wechat.log`), 'wechat');

export default log4js.getLogger;
