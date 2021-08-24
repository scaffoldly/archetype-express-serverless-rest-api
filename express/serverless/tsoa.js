/* eslint-disable @typescript-eslint/no-var-requires */
const { generateRoutes, generateSpec } = require('tsoa');
const fs = require('fs');
const packageJson = require('./package.json');

const { NODE_ENV } = process.env;
const envVars = NODE_ENV
  ? JSON.parse(fs.readFileSync(fs.openSync(`.scaffoldly/${NODE_ENV}/env-vars.json`)))
  : JSON.parse(fs.readFileSync(fs.openSync(`.scaffoldly/env-vars.json`)));

(async () => {
  console.log('Generating spec...');
  await generateSpec({
    basePath: `/${envVars.SERVICE_NAME}`,
    name: envVars.APPLICATION_NAME,
    version: packageJson.version,
    description: `To generate a JWT token, go to the <a href="https://${envVars.SERVERLESS_API_DOMAIN}/auth/jwt.html" target="_blank">JWT Token Generator</a>`,
    entryFile: 'src/app.ts',
    noImplicitAdditionalProperties: 'throw-on-extras',
    controllerPathGlobs: ['src/**/*Controller*.ts'],
    outputDirectory: 'src',
    specVersion: 3,
    securityDefinitions: {
      jwt: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  });

  console.log('Generating routes...');
  await generateRoutes({
    entryFile: 'src/app.ts',
    noImplicitAdditionalProperties: 'throw-on-extras',
    controllerPathGlobs: ['src/**/*Controller*.ts'],
    routesDir: 'src',
    //authenticationModule: 'src/auth.ts',
    noWriteIfUnchanged: true,
  });
})();
