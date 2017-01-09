const fs = require('fs');
const _ = require('lodash');

const defaultConfig = {
  domain: '',
  port: 3000,
  database: undefined,
  wechat: {
    corpid: '',
    secret: '',
    agentid: '',
  },
  logs_dir: undefined,
};

function getConfig(path) {
  const configPath = `${path}/config.json`;
  let config = _.defaults(defaultConfig, {
    database: `${path}/database.json`,
    logs_dir: `${path}/logs`,
  });
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
  if (!fs.existsSync(config.logs_dir)) fs.mkdirSync(config.logs_dir);
  return config;
}

exports.getConfig = getConfig;
