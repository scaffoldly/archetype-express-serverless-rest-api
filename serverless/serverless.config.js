// eslint-disable-next-line @typescript-eslint/no-var-requires
const envVars = require('./.scaffoldly/env-vars.json');

module.exports.repositoryName = envVars['repository-name'];
module.exports.serviceName = envVars['service-name'];
