// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
const os = require('os');

const { NODE_ENV } = process.env;

// Regex for GitHub toJSON() JSON-ish output
const APP_SECRETS_REGEX = / {2}(?<key>.*?): (?<value>.*?)(,\n|\n)/gm;
const APP_SECRETS_FILE = `${os.tmpdir()}/.ci-secrets`;
const APP_SECRET_PREFIX = `${NODE_ENV || ''}_APP_`.toUpperCase();

const envVars = NODE_ENV
  ? JSON.parse(fs.readFileSync(fs.openSync(`.scaffoldly/${NODE_ENV}/env-vars.json`)))
  : JSON.parse(fs.readFileSync(fs.openSync(`.scaffoldly/env-vars.json`)));

Object.entries(envVars).forEach(([key, value]) => {
  module.exports[key] = value;
});

const appSecrets = {};

if (fs.existsSync(APP_SECRETS_FILE)) {
  const secrets = fs.readFileSync(APP_SECRETS_FILE).toString();

  let result;
  while ((result = APP_SECRETS_REGEX.exec(secrets)) !== null) {
    const { key, value } = result.groups;
    if (key.startsWith(APP_SECRET_PREFIX)) {
      appSecrets[`${key.replace(APP_SECRET_PREFIX, '')}`] = value;
    }
  }
}

module.exports.appSecrets = JSON.stringify(appSecrets);
