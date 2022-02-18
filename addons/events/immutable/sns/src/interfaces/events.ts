import { BaseEvent } from '@scaffoldly/serverless-util';

export type ExampleEventV1 = BaseEvent<'ExampleEvent', 1> & {
  value?: string;
};
