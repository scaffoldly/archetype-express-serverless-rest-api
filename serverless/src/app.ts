import {
  corsHandler,
  CorsOptions,
  createApp,
  errorHandler,
  registerDocs,
  registerVersion,
} from '@scaffoldly/serverless-util';
import express from 'express';
import { readFileSync } from 'fs';
import packageJson from '../package.json';
import { RegisterRoutes } from './routes';

import swaggerJson from './swagger.json';

const app = createApp({ logHeaders: true });

const corsOptions: CorsOptions = {};
{% if addon_auth %}
corsOptions.withCredentials = true;
{% endif %}

app.use(corsHandler(corsOptions));

RegisterRoutes(app);

app.use(errorHandler(packageJson.version));

registerDocs(app, swaggerJson);
registerVersion(app, packageJson.version);

{% if addon_auth %}
app.get('/jwt.html', (_req: express.Request, res: express.Response) => {
  const file = readFileSync('./public/jwt.html');
  res.type('html');
  res.send(file);
});
{% endif %}

app.get('/swagger.html', (_req: express.Request, res: express.Response) => {
  const file = readFileSync('./public/swagger.html');
  res.type('html');
  res.send(file);
});

export default app;
