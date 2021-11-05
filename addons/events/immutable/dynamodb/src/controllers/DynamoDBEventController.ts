import { handleDynamoDBStreamRecord, HttpError } from '@scaffoldly/serverless-util';
import { DynamoDBStreamEvent } from 'aws-lambda';
import { Body, Controller, Header, Hidden, Post, Route, Tags } from 'tsoa';
{% for entity in entities %}import { {{ entity | pascal_case }}Model } from '../models/{{ entity | pascal_case }}Model';{% endfor %}
import { {% for entity in entities %}{{ entity | pascal_case }},{% endfor %} } from '../models/interfaces';
{% for entity in entities %}import { {{ entity | pascal_case }}Service } from '../services/{{ entity | pascal_case }}Service';{% endfor %}

@Route('/events/dynamodb')
@Tags('DynamoDB Events')
@Hidden()
export class DynamoDBEventController extends Controller {
  {% for entity in entities %}
  {{ entity }}Service: {{ entity | pascal_case }}Service;
  {% endfor %}

  constructor() {
    super();
    {% for entity in entities %}
    this.{{ entity }}Service = new {{ entity | pascal_case }}Service();
    {% endfor %}
  }

  @Post()
  public async event(@Header('Host') host: string, @Body() event: unknown): Promise<{% for entity in entities %}{{ entity | pascal_case }}{% if not loop.last %} | {% endif %}{% endfor %} | null> {
    if (host !== 'dynamodb.amazonaws.com') {
      throw new HttpError(403, 'Forbidden');
    }

    // batchSize in serverless.yml is 1, blindly get the first record
    const [record] = (event as DynamoDBStreamEvent).Records;

    let handled;

    {% for entity in entities %}
    // eslint-disable-next-line prefer-const
    handled = await handleDynamoDBStreamRecord(record, {
      canHandle: {{entity | pascal_case }}Model.is{{ entity | pascal_case }},
      onInsert: this.{{ entity }}Service.handleAdd,
      onModify: this.{{ entity }}Service.handleModify,
      onRemove: this.{{ entity }}Service.handleRemove,
    });
    if (handled) {
      return handled;
    }
    {% endfor %}

    console.warn('Unhandled stream record', record.dynamodb && record.dynamodb.Keys);

    return null;
  }
}
