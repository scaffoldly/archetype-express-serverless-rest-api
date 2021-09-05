import Joi from 'joi';

export const jwt = {
  pk: Joi.string()
    .required()
    .regex(/jwt_(.*)/), // jwt_${sub}
  sk: Joi.string()
    .required()
    .regex(/session_(.*)/), // session_${jti}
  sub: Joi.string().required(),
  jti: Joi.string().required(),
  aud: Joi.string().required(),
  exp: Joi.number().required(),
  iat: Joi.number().required(),
  iss: Joi.string().required(),
  nbf: Joi.number().optional(),
  scopes: Joi.string().required(),
  expires: Joi.number().required(),
};

export const jwtSchema = Joi.object(jwt).label('Jwt');
