/* eslint-disable @typescript-eslint/no-var-requires */
const { generateRoutes, generateSpec } = require('tsoa');
const fs = require('fs');
const packageJson = require('./package.json');

const { NODE_ENV } = process.env;
const envVars = NODE_ENV
  ? JSON.parse(fs.readFileSync(fs.openSync(`.scaffoldly/${NODE_ENV}/env-vars.json`)))
  : JSON.parse(fs.readFileSync(fs.openSync(`.scaffoldly/env-vars.json`)));

const services = NODE_ENV
  ? JSON.parse(fs.readFileSync(fs.openSync(`.scaffoldly/${NODE_ENV}/services.json`)))
  : JSON.parse(fs.readFileSync(fs.openSync(`.scaffoldly/services.json`)));

(async () => {
  console.log('Generating spec...');
  await generateSpec({
    basePath: `/${envVars['service-slug']}`,
    name: envVars['application-name'],
    version: packageJson.version,{% if auth %}
    description: `To generate a JWT token, go to the <a href="${services['auth-sls-rest-api']['base-url']}/jwt.html" target="_blank">JWT Token Generator</a>`,{% endif %}
    entryFile: 'src/app.ts',
    noImplicitAdditionalProperties: 'throw-on-extras',
    controllerPathGlobs: ['src/**/*Controller*.ts'],
    outputDirectory: 'src',
    specVersion: 3,{% if auth %}
    securityDefinitions: {
      jwt: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },{% endif %}
  });

  console.log('Generating routes...');
  await generateRoutes({
    entryFile: 'src/app.ts',
    noImplicitAdditionalProperties: 'throw-on-extras',
    controllerPathGlobs: ['src/**/*Controller*.ts'],
    routesDir: 'src',{% if auth %}
    authenticationModule: 'src/auth.ts',{% endif %}
    noWriteIfUnchanged: true,
  });
})();
