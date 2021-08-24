// import {
//   dynamoDBStreamEventRequestMapper,
//   dynamoDBStreamEventResponseMapper,
//   snsEventRequestMapper,
//   snsEventResponseMapper,
// } from '@scaffoldly/serverless-util';
import { configure } from '@vendia/serverless-express';
import app from './app';

// import { AWS } from '@scaffoldly/serverless-util';
// AWS.config.logger = console;

exports.handler = configure({
  app,
});
// exports.dynamoDbEventHandler = configure({
//   app,
//   eventSource: {
//     getRequest: dynamoDBStreamEventRequestMapper('/event/dynamodb'),
//     getResponse: dynamoDBStreamEventResponseMapper(),
//   },
// });
// exports.snsEventHandler = configure({
//   app,
//   eventSource: {
//     getRequest: snsEventRequestMapper('/event/sns'),
//     getResponse: snsEventResponseMapper(),
//   },
// });
