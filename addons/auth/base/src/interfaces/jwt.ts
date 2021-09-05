import { Jwt } from '../models/interfaces';

export type TokenRequest = {
  token: string;
};

export type JwtEmailRequest = {
  email: string;
  code?: string;
  remember?: boolean;
};

export type JwtResponse = {
  token?: string;
  payload?: Jwt;
  verificationSentTo?: string;
};

export interface Jwk {
  kty: 'EC';
  crv: 'P-256';
  y: string;
  d?: string;
}

export interface JwksResponse {
  keys: Jwk[];
}
