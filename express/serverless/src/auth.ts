import { authorize } from '@scaffoldly/serverless-util';
import { env } from './env';

const DOMAIN = env.SERVERLESS_API_DOMAIN;

export const expressAuthentication = authorize(DOMAIN);
