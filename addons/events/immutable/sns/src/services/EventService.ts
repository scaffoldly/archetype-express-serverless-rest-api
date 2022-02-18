import { BaseEvent, SNS } from '@scaffoldly/serverless-util';
import { env } from '../env';
import { ExampleEventV1 } from '../interfaces/events';

export class EventService {
  async sendEvent(event: BaseEvent<string, number>): Promise<string | undefined> {
    const sns = await SNS();
    const message = await sns
      .publish({
        TopicArn: env['topic-arn'],
        Subject: event.type,
        Message: JSON.stringify(event),
      })
      .promise();

    console.log(`Sent message to ${env['topic-arn']} with id: ${message.MessageId}`);

    return message.MessageId;
  }

  async handleExampleEvent(event: ExampleEventV1): Promise<ExampleEventV1 | null> {
    console.log('Received event', event);
    return event;
  }
}
