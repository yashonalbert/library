const fs = require('fs');

const defaultConfig = {
  port: '3000',
  database: '',
};

function getConfig(path) {
  const configPath = `${path}/config.json`;
  let config = defaultConfig;
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    fs.writeFileSync(configPath, JSON.stringify(config));
  }
  return config;
}

exports.getConfig = getConfig;
