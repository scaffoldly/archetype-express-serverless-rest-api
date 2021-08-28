import Joi from 'joi';

export const {{ entity }} = {
  pk: Joi.string()
    .required()
    .regex(/userid_(.*)/),
  sk: Joi.string()
    .required()
    .regex(/{{ entity }}_(.*)/),
  userId: Joi.string().required(),
  {{ entityId }}: Joi.string().required(),
  expires: Joi.number().optional(),
  // ... other fields go here, for example, 'value' for demonstration purposes
  value: Joi.string().optional(),
};

export const {{ entity }}Schema = Joi.object({{ entity }}).label('{{ Entity }}');
