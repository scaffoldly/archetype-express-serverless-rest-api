import { authorize } from '@scaffoldly/serverless-util';
import { env } from './env';

const DOMAIN = env['api-gateway-domain'];

export const expressAuthentication = authorize(DOMAIN);
