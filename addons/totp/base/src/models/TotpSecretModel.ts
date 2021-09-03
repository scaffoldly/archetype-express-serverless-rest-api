import { Joi, Model, SERVICE_NAME, STAGE, Table } from '@scaffoldly/serverless-util';
import { TotpSecret } from './interfaces';
import { totpSecret } from './schemas/TotpSecret';

const TABLE_SUFFIX = '';

export class TotpSecretModel {
  public readonly table: Table<TotpSecret>;

  public readonly model: Model<TotpSecret>;

  constructor() {
    this.table = new Table(TABLE_SUFFIX, SERVICE_NAME, STAGE, totpSecret, 'pk', 'sk', [
      { hashKey: 'sk', rangeKey: 'pk', name: 'sk-pk-index', type: 'global' },
    ]);

    this.model = this.table.model;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static prefix = (col: 'pk' | 'sk', value?: any): string => {
    if (col === 'pk') {
      return `totp_${value || ''}`;
    }
    return `secret`;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static isTotp = (obj: any): boolean => {
    if (!obj || !obj.pk || !obj.sk || typeof obj.pk !== 'string' || typeof obj.sk !== 'string') {
      return false;
    }

    const { pk, sk } = obj as { pk: string; sk: string };

    try {
      Joi.assert(pk, totpSecret.pk);
      Joi.assert(sk, totpSecret.sk);
    } catch (e) {
      return false;
    }

    return true;
  };
}
