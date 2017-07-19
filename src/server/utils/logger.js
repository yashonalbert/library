import log4js from 'log4js';
import config from './config';

log4js.configure({
  appenders: {
    koa: {
      type: 'dateFile',
      filename: `${config.logs_dir}/koa.log`,
    },
    api: {
      type: 'dateFile',
      filename: `${config.logs_dir}/api.log`,
    },
    schedule: {
      type: 'dateFile',
      filename: `${config.logs_dir}/schedule.log`,
    },
  },
  categories: {
    default: { appenders: ['koa', 'api', 'schedule'], level: 'info' },
  },
});

export default log4js.getLogger;
