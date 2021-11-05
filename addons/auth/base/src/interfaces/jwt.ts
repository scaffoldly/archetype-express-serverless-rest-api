import { Jwt } from '../models/interfaces';

export type TokenRequest = {
  token: string;
};

export interface JwtRequest {
  remember?: boolean;
}

export type JwtResponse = {
  token?: string;
  payload?: Jwt;
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
