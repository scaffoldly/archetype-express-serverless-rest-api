import {
  BaseJwtPayload,
  cookieDomain,
  cookiePrefix,
  cookieSecure,
  extractUserId,
  generateAudience,
  generateSubject,
  GetSecret,
  HttpError,
  HttpRequest,
  SetSecret,
} from '@scaffoldly/serverless-util';
import moment from 'moment';
import { ulid } from 'ulid';
import { JWK, JWKECKey, JWKS, JWT } from 'jose';
import Cookies from 'cookies';
import { JwtResponse, JwtEmailRequest, Jwk, JwksResponse } from '../interfaces/jwt';
import { JwtModel } from '../models/JwtModel';
import { Jwt } from '../models/interfaces';
import { TotpService } from './TotpService';
import { env } from '../env';

export const JWT_EXPIRATION_SECONDS = 3600;
export const REFRESH_EXPIRATION_MONTHS = 12;
export const JWKS_PRIMARY_SECRET_NAME = 'jwks-primary';
export const JWKS_SECONDARY_SECRET_NAME = 'jwks-secondary';

export interface PemJwk {
  pem: string;
  jwk: Jwk;
}

export interface GeneratedKeys {
  issuer: string;
  publicKey: PemJwk;
  privateKey: PemJwk;
}

export class JwtService {
  jwtModel: JwtModel;

  totpService: TotpService;

  constructor() {
    this.jwtModel = new JwtModel();
    this.totpService = new TotpService();
  }

  getPublicKeys = async (issuer: string): Promise<JwksResponse> => {
    const jwks = await this.getOrCreateKeys(issuer);
    return { keys: jwks.map((jwk) => jwk.publicKey.jwk) };
  };

  public emailLogin = async (request: JwtEmailRequest, issuer: string): Promise<JwtResponse> => {
    console.log('Email login request', request);

    const totp = request.code
      ? await this.totpService.verify({ id: request.email, token: request.code })
      : await this.totpService.sendEmail({ email: request.email });

    if (!totp.verified && !request.code) {
      console.log('Verification required or missing code');
      return {
        verificationSentTo: totp.id,
      };
    }

    if (!totp.verified && request.code) {
      throw new HttpError(401, 'Unauthorized');
    }

    return this.createJwt(totp.id, issuer, request.remember);
  };

  private createJwt = async (
    userId: string,
    issuer: string,
    remember = true,
    sessionId: string = ulid(),
  ): Promise<JwtResponse> => {
    console.log(`Creating jwt for ${userId} with issuer ${issuer} (session id: ${sessionId})`);

    const aud = generateAudience(env['stage-domain'], 'auth');
    const sub = generateSubject(aud, userId);

    const payload: Jwt = {
      pk: JwtModel.prefix('pk', sub),
      sk: JwtModel.prefix('sk', sessionId),
      aud,
      exp: moment().add(JWT_EXPIRATION_SECONDS, 'second').unix(),
      iat: moment().unix(),
      iss: issuer,
      jti: sessionId,
      sub,
      scopes: 'auth:access',
      expires: remember
        ? moment().add(REFRESH_EXPIRATION_MONTHS, 'month').unix()
        : moment().add(JWT_EXPIRATION_SECONDS, 'second').unix(),
    };

    const keys = await this.getOrCreateKeys(issuer);
    const key = JWK.asKey(keys[0].privateKey.jwk as JWKECKey);

    const token = JWT.sign(payload, key, {
      header: {
        typ: 'JWT',
      },
    });

    const jwt = await this.jwtModel.model.update(payload);

    console.log(`Created JWT with payload`, payload);

    return {
      token,
      payload: jwt.attrs,
    };
  };

  public createRefreshCookie = async (jwt: Jwt, httpRequest: HttpRequest): Promise<string> => {
    console.log('Creating refresh cookie for', extractUserId(jwt));

    const keys = await this.getOrCreateKeys(jwt.iss);
    const key = JWK.asKey(keys[1].privateKey.jwk as JWKECKey);

    const refreshPayload: Jwt = { ...jwt, exp: jwt.expires, scopes: 'auth:refresh' };

    console.log('Refresh payload', refreshPayload);

    const token = JWT.sign(refreshPayload, key, {
      header: {
        typ: 'JWT',
      },
    });

    const domain = cookieDomain(httpRequest);
    const prefix = cookiePrefix('refresh');
    const secure = cookieSecure();

    const cookie = new Cookies.Cookie(encodeURIComponent(`${prefix}_${jwt.pk}_${jwt.sk}`), token, {
      domain,
      maxAge: (jwt.expires - jwt.iat) * 1000,
      overwrite: true,
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure,
    });

    return cookie.toHeader();
  };

  public refresh = async (
    token: string,
    issuer: string,
    httpRequest: HttpRequest,
  ): Promise<JwtResponse> => {
    const keys = await this.getOrCreateKeys(issuer);
    const jwks = new JWKS.KeyStore(keys.map((key) => JWK.asKey(key.privateKey.jwk as JWKECKey)));

    const verifiedJwt = JWT.verify(token, jwks, {
      ignoreExp: true,
      issuer,
      audience: generateAudience(env['stage-domain'], 'auth'),
    }) as Jwt;

    if (!verifiedJwt) {
      console.warn('Unable to verify token');
      throw new HttpError(403, 'Forbidden');
    }

    console.log('Refreshing', verifiedJwt);

    const jwt = await this.jwtModel.model.get(verifiedJwt.pk, verifiedJwt.sk);

    if (!jwt) {
      console.warn('Missing jwt in database');
      throw new HttpError(403, 'Forbidden');
    }

    const cookie = this.extractRefreshCookie(httpRequest, jwt.attrs.pk, jwt.attrs.sk);
    if (!cookie.values.length) {
      console.warn(`Unable to find cookie with name ${cookie.name}`);
      throw new HttpError(403, 'Forbidden');
    }

    const verifiedRefresh = cookie.values.reduce((acc: Jwt | null, value) => {
      if (acc) {
        return acc;
      }

      const verified = JWT.verify(value, jwks, {
        audience: jwt.attrs.aud,
        issuer: jwt.attrs.iss,
        jti: jwt.attrs.jti,
        subject: jwt.attrs.sub,
      }) as Jwt;
      if (verified) {
        return verified;
      }

      return null;
    }, null);

    if (!verifiedRefresh) {
      console.warn('Unable to find matching cookie');
      throw new HttpError(403, 'Forbidden');
    }

    console.log('Matched and verified refresh token', verifiedRefresh);

    if (verifiedRefresh.scopes.indexOf('auth:refresh') === -1) {
      console.warn('Not a refresh token');
      throw new HttpError(403, 'Forbidden');
    }

    return this.createJwt(extractUserId(jwt.attrs), jwt.attrs.iss, true, jwt.attrs.jti);
  };

  public verify = async (token: string, issuer: string): Promise<BaseJwtPayload> => {
    const decoded = JWT.decode(token) as Jwt;
    if (!decoded) {
      console.warn('Unable to decode token');
      throw new HttpError(401, 'Unauthorized');
    }

    console.log('Verifying token', decoded);

    const keys = await this.getOrCreateKeys(issuer);
    const jwks = new JWKS.KeyStore(keys.map((key) => JWK.asKey(key.privateKey.jwk as JWKECKey)));

    const verified = JWT.verify(token, jwks, {
      audience: generateAudience(env['stage-domain'], 'auth'),
      issuer,
    }) as Jwt;

    if (!verified) {
      console.warn('Unable to verify token');
      throw new HttpError(401, 'Unauthorized');
    }

    if (verified.scopes.indexOf('auth:access') === -1) {
      console.warn('Missing auth:access scope');
      throw new HttpError(401, 'Unauthorized');
    }

    console.log('Token is verified', verified);

    return verified;
  };

  private getOrCreateKeys = async (issuer: string): Promise<GeneratedKeys[]> => {
    let primary = await GetSecret(JWKS_PRIMARY_SECRET_NAME);
    let secondary = await GetSecret(JWKS_SECONDARY_SECRET_NAME);

    if (!primary) {
      const generatedKeys = this.generateKeys(issuer);

      await SetSecret(JWKS_PRIMARY_SECRET_NAME, JSON.stringify(generatedKeys), true);
      primary = await GetSecret(JWKS_PRIMARY_SECRET_NAME);
      if (!primary) {
        throw new Error('Unknown issue generating/storing JWKS');
      }
    }
    if (!secondary) {
      const generatedKeys = this.generateKeys(issuer);

      await SetSecret(JWKS_SECONDARY_SECRET_NAME, JSON.stringify(generatedKeys), true);
      secondary = await GetSecret(JWKS_SECONDARY_SECRET_NAME);
      if (!secondary) {
        throw new Error('Unknown issue generating/storing JWKS');
      }
    }

    const primaryKey = JSON.parse(Buffer.from(primary, 'base64').toString('utf8'));
    const secondaryKey = JSON.parse(Buffer.from(secondary, 'base64').toString('utf8'));

    return [primaryKey, secondaryKey];
  };

  private generateKeys = (issuer: string): GeneratedKeys => {
    const kid = ulid();
    const key = JWK.generateSync('EC', 'P-256', { use: 'sig', kid }, true);
    console.log(`Generated a new key with kid: ${kid}`);

    return {
      issuer,
      publicKey: {
        pem: key.toPEM(false),
        jwk: key.toJWK(false) as Jwk,
      },
      privateKey: {
        pem: key.toPEM(true),
        jwk: key.toJWK(true) as Jwk,
      },
    };
  };

  private extractRefreshCookie = (request: HttpRequest, pk: string, sk: string) => {
    const refreshCookie = {
      name: `${cookiePrefix('refresh')}_${pk}_${sk}`,
      values: [] as string[],
    };

    if (!request) {
      console.warn('Missing request');
      return refreshCookie;
    }

    const { headers } = request;
    if (!headers) {
      console.warn('Missing headers');
      return refreshCookie;
    }

    const { cookie } = headers as Record<string, string>;
    if (!cookie) {
      console.warn('Missing Cookie header');
      return refreshCookie;
    }

    const cookies = cookie.split(';');
    if (!cookies || cookies.length === 0) {
      console.warn('No cookies');
      return refreshCookie;
    }

    return cookies.reduce((acc, item) => {
      const [name, value] = item.trim().split('=');
      if (!name || !value) {
        console.warn(`Missing name or value in ${item}`);
        return acc;
      }

      if (decodeURIComponent(name) === acc.name) {
        acc.values.push(value);
      }

      return acc;
    }, refreshCookie);
  };
}
