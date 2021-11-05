import { BaseJwtPayload, HttpError, extractUserId } from '@scaffoldly/serverless-util';
import moment from 'moment';
import { ulid } from 'ulid';
import { {{ EntityRequest }}, {{ EntityResponse }}, {{ EntityListResponse }} } from '../interfaces/{{ entity }}';
import { {{ EntityModel }} } from '../models/{{ EntityModel }}';
import { {{ Entity }} } from '../models/interfaces';

export class {{ EntityService }} {
  {{ entityModel }}: {{ EntityModel }};

  constructor() {
    this.{{ entityModel }} = new {{ EntityModel }}();
  }

  public create = async (
    {{ entityRequest }}: {{ EntityRequest }},
    user: BaseJwtPayload,
  ): Promise<{{ Entity }}> => {
    const {{ entityId }} = ulid();
    console.log(`Creating with id:`, JSON.stringify({{ entityRequest }}));

    const {{ entity }} = await this.{{ entityModel }}.model.create(
      {
        pk: {{ EntityModel }}.prefix('pk', extractUserId(user, '__ANONYMOUS__')),
        sk: {{ EntityModel }}.prefix('sk', {{ entityId }}),
        {{ entityId }},
        userId: extractUserId(user, '__ANONYMOUS__'),
        ...{{ entityRequest }},
      },
      { overwrite: false },
    );

    console.log(`Created with id`, JSON.stringify({{ entity }}.attrs));

    if (!{{ entity }} || !{{ entity }}.attrs) {
      throw new HttpError(500, 'Unable to create');
    }

    return {{ entity }}.attrs;
  };

  public list = async (
    user: BaseJwtPayload,
    nextPk?: string,
    nextSk?: string,
    limit?: number,
  ): Promise<{{ EntityListResponse }}> => {
    if ((nextPk && !nextSk) || (!nextPk && nextSk)) {
      throw new HttpError(400, 'nextPk and nextSk are required together');
    }

    console.log(
      `Listing for user: ${extractUserId(
        user,
        '__ANONYMOUS__',
      )}, nextPk: ${nextPk}, nextSk: ${nextSk}, limit: ${limit}`,
    );

    const [count] = await this.{{ entityModel }}.model
      .query({{ EntityModel }}.prefix('pk', extractUserId(user, '__ANONYMOUS__')))
      .where('sk')
      .beginsWith({{ EntityModel }}.prefix('sk'))
      .filter('expires')
      .exists(false)
      .select('COUNT')
      .exec()
      .promise();

    let query = this.{{ entityModel }}.model
      .query({{ EntityModel }}.prefix('pk', extractUserId(user, '__ANONYMOUS__')))
      .where('sk')
      .beginsWith({{ EntityModel }}.prefix('sk'))
      .filter('expires')
      .exists(false);

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

  public getById = async ({{ entityId }}: string, user: BaseJwtPayload): Promise<{{ EntityResponse }}> => {
    const {{ entity }} = await this.{{ entityModel }}.model.get(
      {{ EntityModel }}.prefix('pk', extractUserId(user, '__ANONYMOUS__')),
      {{ EntityModel }}.prefix('sk', {{ entityId }}),
    );

    if (!{{ entity }} || {{ entity }}.attrs.expires) {
      throw new HttpError(404, 'Not Found');
    }

    return {{ entity }}.attrs;
  };

  public updateById = async (
    {{ entityId }}: string,
    {{ entityRequest }}: {{ EntityRequest }},
    user: BaseJwtPayload,
  ): Promise<{{ EntityResponse }}> => {
    let {{ entity }} = await this.{{ entityModel }}.model.get(
      {{ EntityModel }}.prefix('pk', extractUserId(user, '__ANONYMOUS__')),
      {{ EntityModel }}.prefix('sk', {{ entityId }}),
    );

    if (!{{ entity }} || {{ entity }}.attrs.expires) {
      throw new HttpError(404, 'Not Found');
    }

    {{ entity }} = await this.{{ entityModel }}.model.update({
      pk: {{ EntityModel }}.prefix('pk', extractUserId(user, '__ANONYMOUS__')),
      sk: {{ EntityModel }}.prefix('sk', {{ entityId }}),
      ...{{ entityRequest }},
    });

    if (!{{ entity }} || !{{ entity }}.attrs) {
      throw new HttpError(500, 'Unable to update {{ entity }}');
    }

    return {{ entity }}.attrs;
  };

  public deleteById = async (
    {{ entityId }}: string,
    user: BaseJwtPayload,
    async = false,
  ): Promise<{{ EntityResponse }} | null> => {
    if (async) {
      let {{ entity }} = await this.{{ entityModel }}.model.get(
        {{ EntityModel }}.prefix('pk', extractUserId(user, '__ANONYMOUS__')),
        {{ EntityModel }}.prefix('sk', {{ entityId }}),
      );
  
      if (!{{ entity }} || {{ entity }}.attrs.expires) {
        throw new HttpError(404, 'Not Found');
      }

      // Set expires on row for DynamoDB expiration
      {{ entity }} = await this.{{ entityModel }}.model.update({
        pk: {{ EntityModel }}.prefix('pk', extractUserId(user, '__ANONYMOUS__')),
        sk: {{ EntityModel }}.prefix('sk', {{ entityId }}),
        expires: moment().unix(),
      });

      return {{ entity }}.attrs;
    }

    await this.{{ entityModel }}.model.destroy(
      {{ EntityModel }}.prefix('pk', extractUserId(user, '__ANONYMOUS__')),
      {{ EntityModel }}.prefix('sk', {{ entityId }}),
    );
    return null;
  };

  public handleAdd = async ({{ entity }}: {{ Entity }}): Promise<{{ Entity }} | null> => {
    console.log('Added', JSON.stringify({{ entity }}));
    // Here you can do any async handling of new entities
    // Optionally, return null if you want the event to continue propagation to additional handlers in the controller
    return {{ entity }};
  };

  public handleModify = async (new{{ Entity }}: {{ Entity }}, prev{{ Entity }}: {{ Entity }}): Promise<{{ Entity }} | null> => {
    console.log('Modified:', JSON.stringify(new{{ Entity }}));
    console.log('Previous:', JSON.stringify(prev{{ Entity }}));
    // Here you can do any async handling of updated entities
    // Optionally, return null if you want the event to continue propagation to additional handlers in the controller
    return new{{ Entity }};
  };

  public handleRemove = async ({{ entity }}: {{ Entity }}): Promise<{{ Entity }} | null> => {
    console.log('Removed', JSON.stringify({{ entity }}));
    // Here you can do any async handling of removed entities
    // Optionally, return null if you want the event to continue propagation to additional handlers in the controller
    return {{ entity }};
  };
}
