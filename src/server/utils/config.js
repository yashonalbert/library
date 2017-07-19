import fs from 'fs';
import _ from 'lodash';
import path from 'path';

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
  raven: '',
};

function getConfig(workPath) {
  const configPath = `${workPath}/config.json`;
  let config = _.defaults(defaultConfig, {
    database: `${workPath}/library.sqlite`,
    logs_dir: `${workPath}/logs`,
  });
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
  if (!fs.existsSync(config.logs_dir)) fs.mkdirSync(config.logs_dir);
  return config;
}

const config = getConfig(process.env.WorkPath ? process.env.WorkPath : path.join(__dirname, '..', '..'));

export default config;
