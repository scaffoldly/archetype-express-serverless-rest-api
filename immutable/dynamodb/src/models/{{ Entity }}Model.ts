import { Joi, Model, SERVICE_NAME, STAGE, Table } from '@scaffoldly/serverless-util';
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
  static {{ isEntity }} = (obj: any): boolean => {
    if (!obj || !obj.pk || !obj.sk || typeof obj.pk !== 'string' || typeof obj.sk !== 'string') {
      return false;
    }

    const { pk, sk } = obj as { pk: string; sk: string };

    try {
      Joi.assert(pk, {{ entity }}.pk);
      Joi.assert(sk, {{ entity }}.sk);
    } catch (e) {
      return false;
    }

    return true;
  };
}
