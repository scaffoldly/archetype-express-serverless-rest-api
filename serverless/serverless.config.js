// eslint-disable-next-line @typescript-eslint/no-var-requires
const envVars = require('./.scaffoldly/env-vars.json');

module.exports.repositoryName = envVars['repository'];
module.exports.serviceName = envVars['service-name'];
