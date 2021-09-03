import Joi from 'joi';
import { encryptedFieldSchema } from './EncryptedField';

export const totpSecret = {
  pk: Joi.string()
    .required()
    .regex(/totp_(.*)/),
  sk: Joi.string()
    .required()
    .regex(/secret/),
  id: Joi.string().required(),
  expires: Joi.number().required(),
  encryptedSecret: encryptedFieldSchema.required(),
};

export const totpSecretSchema = Joi.object(totpSecret).label('TotpSecret');
