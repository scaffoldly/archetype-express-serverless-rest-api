import { HttpError } from '@scaffoldly/serverless-util';
import { EmailLoginRequest, EmailLoginResponse } from '../interfaces/email';
import { JwtService } from './JwtService';
import { LoginService } from './interfaces/LoginService';
import { TotpService } from './TotpService';

export const TOKEN_WINDOW_MINUTES = 10;

export class EmailLoginService implements LoginService<EmailLoginRequest, EmailLoginResponse> {
  jwtService: JwtService;

  totpService: TotpService;

  constructor() {
    this.jwtService = new JwtService();
    this.totpService = new TotpService();
  }

  public login = async (
    request: EmailLoginRequest,
    issuer: string,
  ): Promise<EmailLoginResponse> => {
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

    return this.jwtService.createJwt(totp.id, issuer, request.remember);
  };
}
