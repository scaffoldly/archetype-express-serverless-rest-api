import {
  Joi,
  Model,
  SERVICE_NAME,
  STAGE,
  Table,
  unmarshallDynamoDBImage,
} from '@scaffoldly/serverless-util';
import { StreamRecord } from 'aws-lambda';
import { {{ Entity }} } from './interfaces';
import { {{ entity }} } from './schemas/{{ Entity }}';

const TABLE_SUFFIX = '';

export class {{ EntityModel }} {
  public readonly table: Table<{{ Entity }}>;

  public readonly model: Model<{{ Entity }}>;

  constructor() {
    this.table = new Table(TABLE_SUFFIX, SERVICE_NAME, STAGE, {{ entity }}, 'pk', 'sk', [
      { hashKey: 'sk', rangeKey: 'pk', name: 'sk-pk-index', type: 'global' },
    ]);

    this.model = this.table.model;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static prefix = (col: 'pk' | 'sk', value?: any): string => {
    if (col === 'pk') {
      return `userid_${value || ''}`;
    }
    return `{{ entity }}_${value || ''}`;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static {{ isEntity }} = (record: StreamRecord): boolean => {
    if (!record) {
      return false;
    }

    const check = unmarshallDynamoDBImage(record.Keys) as { pk: string; sk: string };

    if (!check.pk || !check.sk || typeof check.pk !== 'string' || typeof check.sk !== 'string') {
      return false;
    }

    const { pk, sk } = check;

    try {
      Joi.assert(pk, {{ entity }}.pk);
      Joi.assert(sk, {{ entity }}.sk);
    } catch (e) {
      return false;
    }

    return true;
  };
}
