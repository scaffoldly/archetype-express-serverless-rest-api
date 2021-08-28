import { Joi, Model, SERVICE_NAME, STAGE, Table } from '@scaffoldly/serverless-util';
import { {{ entity | pascal_case }} } from './interfaces';
import { {{ entity | lower_case }} } from './schemas/{{ entity | pascal_case }}';

const TABLE_SUFFIX = '';

export class {{ entity | pascal_case }}Model {
  public readonly table: Table<{{ entity | pascal_case }}>;

  public readonly model: Model<{{ entity | pascal_case }}>;

  constructor() {
    this.table = new Table(TABLE_SUFFIX, SERVICE_NAME, STAGE, {{ entity | lower_case }}, 'pk', 'sk', [
      { hashKey: 'sk', rangeKey: 'pk', name: 'sk-pk-index', type: 'global' },
    ]);

    this.model = this.table.model;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static prefix = (col: 'pk' | 'sk', value?: any): string => {
    if (col === 'pk') {
      return `userid_${value || ''}`;
    }
    return `{{ entity | lower_case }}_${value || ''}`;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static is{{ entity | pascal_case }} = (obj: any): boolean => {
    if (!obj || !obj.pk || !obj.sk || typeof obj.pk !== 'string' || typeof obj.sk !== 'string') {
      return false;
    }

    const { pk, sk } = obj as { pk: string; sk: string };

    try {
      Joi.assert(pk, {{ entity | lower_case }}.pk);
      Joi.assert(sk, {{ entity | lower_case }}.sk);
    } catch (e) {
      return false;
    }

    return true;
  };
}
