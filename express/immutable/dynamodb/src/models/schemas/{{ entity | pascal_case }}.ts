import Joi from 'joi';

export const {{ entity | lower_case }} = {
  pk: Joi.string()
    .required()
    .regex(/userid_(.*)/),
  sk: Joi.string()
    .required()
    .regex(/{{ entity | lower_case }}_(.*)/),
  userId: Joi.string().required(),
  {{ entity | lower_case }}Id: Joi.string().required(),
  expires: Joi.number().optional(),
  // ... other fields go here, for example, 'value' for demonstration purposes
  value: Joi.string().optional(),
};

export const {{ entity | lower_case }}Schema = Joi.object({{ entity | lower_case }}).label('{{ entity | pascal_case }}');
