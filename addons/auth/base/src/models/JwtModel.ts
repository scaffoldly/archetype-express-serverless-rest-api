import { Joi, Model, SERVICE_NAME, STAGE, Table } from '@scaffoldly/serverless-util';
import { Jwt } from './interfaces';
import { jwt } from './schemas/Jwt';

const TABLE_SUFFIX = '';

export class JwtModel {
  public readonly table: Table<Jwt>;

  public readonly model: Model<Jwt>;

  constructor() {
    this.table = new Table(TABLE_SUFFIX, SERVICE_NAME, STAGE, jwt, 'pk', 'sk', [
      { hashKey: 'sk', rangeKey: 'pk', name: 'sk-pk-index', type: 'global' },
    ]);

    this.model = this.table.model;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static prefix = (col: 'pk' | 'sk', value?: any): string => {
    if (col === 'pk') {
      return `jwt_${value || ''}`;
    }
    return `session_${value || ''}`;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static isJwt = (obj: any): boolean => {
    if (!obj || !obj.pk || !obj.sk || typeof obj.pk !== 'string' || typeof obj.sk !== 'string') {
      return false;
    }

    const { pk, sk } = obj as { pk: string; sk: string };

    try {
      Joi.assert(pk, jwt.pk);
      Joi.assert(sk, jwt.sk);
    } catch (e) {
      return false;
    }

    return true;
  };
}
