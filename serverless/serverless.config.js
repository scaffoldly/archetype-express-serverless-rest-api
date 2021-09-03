// eslint-disable-next-line @typescript-eslint/no-var-requires
const envVars = require('./.scaffoldly/env-vars.json');

module.exports.serviceName = envVars['service-name'];
module.exports.serviceSlug = envVars['service-slug'];
