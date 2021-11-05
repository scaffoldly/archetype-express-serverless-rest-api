import { configure } from '@vendia/serverless-express';
import app from './app';

// import { AWS } from '@scaffoldly/serverless-util';
// AWS.config.logger = console;

exports.handler = configure({
  app,
  eventSourceRoutes: {
{% if persistence == 'dynamodb' and ddb_stream_events %}
    AWS_DYNAMODB: '/events/dynamodb',
{% endif %}
  },
});
  