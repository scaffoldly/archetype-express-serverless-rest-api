import { DecodedJwtPayload, HttpError, userId } from '@scaffoldly/serverless-util';
import moment from 'moment';
import { ulid } from 'ulid';
import { {{ entity | pascal_case }}Request, {{ entity | pascal_case }}Response, {{ entity | pascal_case }}ListResponse } from '../interfaces/{{ entity | lower_case }}';
import { {{ entity | pascal_case }}Model } from '../models/{{ entity | pascal_case }}Model';
import { {{ entity | pascal_case }} } from '../models/interfaces';

export class {{ entity | pascal_case }}Service {
  {{ entity | lower_case }}Model: {{ entity | pascal_case }}Model;

  constructor() {
    this.{{ entity | lower_case }}Model = new {{ entity | pascal_case }}Model();
  }

  public create = async (
    {{ entity | lower_case }}Request: {{ entity | pascal_case }}Request,
    user: DecodedJwtPayload,
  ): Promise<{{ entity | pascal_case }}> => {
    const {{ entity | lower_case }}Id = ulid();
    console.log(`Creating with id:`, JSON.stringify({{ entity | lower_case }}Request));

    const {{ entity | lower_case }} = await this.{{ entity | lower_case }}Model.model.create(
      {
        pk: {{ entity | pascal_case }}Model.prefix('pk', userId(user, '__ANONYMOUS__')),
        sk: {{ entity | pascal_case }}Model.prefix('sk', {{ entity | lower_case }}Id),
        {{ entity | lower_case }}Id,
        userId: userId(user, '__ANONYMOUS__'),
        ...{{ entity | lower_case }}Request,
      },
      { overwrite: false },
    );

    console.log(`Created with id`, JSON.stringify({{ entity | lower_case }}.attrs));

    if (!{{ entity | lower_case }} || !{{ entity | lower_case }}.attrs) {
      throw new HttpError(500, 'Unable to create');
    }

    return {{ entity | lower_case }}.attrs;
  };

  public list = async (
    user: DecodedJwtPayload,
    nextPk?: string,
    nextSk?: string,
    limit?: number,
  ): Promise<{{ entity | pascal_case }}ListResponse> => {
    if ((nextPk && !nextSk) || (!nextPk && nextSk)) {
      throw new HttpError(400, 'nextPk and nextSk are required together');
    }

    console.log(
      `Listing for user: ${userId(
        user,
        '__ANONYMOUS__',
      )}, nextPk: ${nextPk}, nextSk: ${nextSk}, limit: ${limit}`,
    );

    const [count] = await this.{{ entity | lower_case }}Model.model
      .query({{ entity | pascal_case }}Model.prefix('pk', userId(user, '__ANONYMOUS__')))
      .where('sk')
      .beginsWith({{ entity | pascal_case }}Model.prefix('sk'))
      // .filter('expires')
      // .exists(false)
      .select('COUNT')
      .exec()
      .promise();

    let query = this.{{ entity | lower_case }}Model.model
      .query({{ entity | pascal_case }}Model.prefix('pk', userId(user, '__ANONYMOUS__')))
      .where('sk')
      .beginsWith({{ entity | pascal_case }}Model.prefix('sk'));
      // .filter('expires')
      // .exists(false);

    if (nextPk && nextSk) {
      query = query.startKey(nextPk, nextSk);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const [results] = await query.exec().promise();

    if (!results || !results.Count) {
      console.log('No results');
      return { results: [], count: 0, total: 0 };
    }

    console.log(
      `Found ${results.Count}/${count.Count} results. Last evaluated key: ${results.LastEvaluatedKey}`,
    );

    return {
      results: results.Items.map((item) => item.attrs),
      count: results.Items.length,
      total: count.Count,
      next: results.LastEvaluatedKey
        ? { pk: results.LastEvaluatedKey.pk, sk: results.LastEvaluatedKey.sk }
        : undefined,
    };
  };

  public getById = async ({{ entity | lower_case }}Id: string, user: DecodedJwtPayload): Promise<{{ entity | pascal_case }}Response> => {
    const {{ entity | lower_case }} = await this.{{ entity | lower_case }}Model.model.get(
      {{ entity | pascal_case }}Model.prefix('pk', userId(user, '__ANONYMOUS__')),
      {{ entity | pascal_case }}Model.prefix('sk', {{ entity | lower_case }}Id),
    );

    if (!{{ entity | lower_case }} || {{ entity | lower_case }}.attrs.expires) {
      throw new HttpError(404, 'Not Found');
    }

    return {{ entity | lower_case }}.attrs;
  };

  public updateById = async (
    {{ entity | lower_case }}Id: string,
    {{ entity | lower_case }}Request: {{ entity | pascal_case }}Request,
    user: DecodedJwtPayload,
  ): Promise<{{ entity | pascal_case }}Response> => {
    const {{ entity | lower_case }} = await this.{{ entity | lower_case }}Model.model.update({
      pk: {{ entity | pascal_case }}Model.prefix('pk', userId(user, '__ANONYMOUS__')),
      sk: {{ entity | pascal_case }}Model.prefix('sk', {{ entity | lower_case }}Id),
      ...{{ entity | lower_case }}Request,
    });

    if (!{{ entity | lower_case }} || !{{ entity | lower_case }}.attrs) {
      throw new HttpError(500, 'Unable to update {{ entity | lower_case }}');
    }

    return {{ entity | lower_case }}.attrs;
  };

  public deleteById = async (
    {{ entity | lower_case }}Id: string,
    user: DecodedJwtPayload,
    async = false,
  ): Promise<{{ entity | pascal_case }}Response | null> => {
    if (async) {
      // Set expires on row for DynamoDB expiration
      const {{ entity | lower_case }} = await this.{{ entity | lower_case }}Model.model.update({
        pk: {{ entity | pascal_case }}Model.prefix('pk', userId(user, '__ANONYMOUS__')),
        sk: {{ entity | pascal_case }}Model.prefix('sk', {{ entity | lower_case }}Id),
        expires: moment().unix(),
      });

      return {{ entity | lower_case }}.attrs;
    }

    await this.{{ entity | lower_case }}Model.model.destroy(
      {{ entity | pascal_case }}Model.prefix('pk', userId(user, '__ANONYMOUS__')),
      {{ entity | pascal_case }}Model.prefix('sk', {{ entity | lower_case }}Id),
    );
    return null;
  };

  public handleAdd = async ({{ entity | lower_case }}: {{ entity | pascal_case }}): Promise<void> => {
    console.log('{{ entity | pascal_case }} was added', JSON.stringify({{ entity | lower_case }}));
    // Here you can do any async handling of new entities
  };

  public handleModify = async (new{{ entity | pascal_case }}: {{ entity | pascal_case }}, prev{{ entity | pascal_case }}: {{ entity | pascal_case }}): Promise<void> => {
    console.log('{{ entity | pascal_case }} was modified:', JSON.stringify(new{{ entity | pascal_case }}));
    console.log('Previous:', JSON.stringify(prev{{ entity | pascal_case }}));
    // Here you can do any async handling of updated entities
  };

  public handleRemove = async ({{ entity | lower_case }}: {{ entity | pascal_case }}): Promise<void> => {
    console.log('{{ entity | pascal_case }} was removed', JSON.stringify({{ entity | lower_case }}));
    // Here you can do any async handling of removed entities
  };
}
