import { handleSnsEventRecord, HttpError } from '@scaffoldly/serverless-util';
import { SNSEvent } from 'aws-lambda';
import { Body, Controller, Header, Hidden, Post, Route, Tags } from 'tsoa';
import { EventService } from '../services/EventService';
import { ExampleEventV1 } from '../interfaces/events';

@Route('/events/sns')
@Tags('SNS Events')
@Hidden()
export class SnsEventController extends Controller {
  eventService: EventService;

  constructor() {
    super();
    this.eventService = new EventService();
  }

  @Post()
  public async event(
    @Header('Host') host: string,
    @Body() event: unknown,
  ): Promise<ExampleEventV1 | null> {
    if (host !== 'sns.amazonaws.com') {
      throw new HttpError(403, 'Forbidden');
    }

    const [record] = (event as SNSEvent).Records;

    let handled;

    // eslint-disable-next-line prefer-const
    handled = await handleSnsEventRecord(record, {
      canHandle: (type, version) => type === 'ExampleEvent' && version === 1,
      handle: this.eventService.handleExampleEvent.bind(this.eventService),
    });

    if (handled) {
      return handled;
    }

    return null;
  }
}
