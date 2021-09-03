import { HttpError } from '@scaffoldly/serverless-util';
import * as twofactor from 'node-2fa';
import moment from 'moment';
import { EmailTotpRequest, TotpResponse, VerifyTotpRequest } from '../interfaces/totp';
import { TotpSecretModel } from '../models/TotpSecretModel';
import { env } from '../env';
import { SesService } from './aws/ses/SesService';
import { EmailService, isEmail } from './interfaces/EmailService';
import { EncryptionService } from './interfaces/EncryptionService';
import { KmsService } from './aws/kms/KmsService';

export const TOKEN_WINDOW_MINUTES = 10;

export class TotpService {
  totpSecretModel: TotpSecretModel;

  emailService: EmailService;

  encryptionService: EncryptionService;

  constructor() {
    this.totpSecretModel = new TotpSecretModel();
    this.emailService = new SesService(`slyses.${env['stage-domain']}`);
    this.encryptionService = new KmsService();
  }

  public sendEmail = async (request: EmailTotpRequest): Promise<TotpResponse> => {
    if (!isEmail(request.email)) {
      throw new HttpError(400, 'Invalid email address');
    }

    const email = request.email.toLowerCase().trim();

    const { secret } = twofactor.generateSecret({
      account: email,
      name: env['service-name'],
    });

    // Create a temporary secret that will self-delete in TOKEN_WINDOW_MINUTES time
    const totpSecret = await this.totpSecretModel.model.update({
      pk: TotpSecretModel.prefix('pk', email),
      sk: TotpSecretModel.prefix('sk'),
      id: email,
      expires: moment().add(TOKEN_WINDOW_MINUTES, 'minute').unix(),
      encryptedSecret: await this.encryptionService.encrypt(secret),
    });

    const token = twofactor.generateToken(secret);

    if (!token) {
      throw new HttpError(400, 'Unable to generate token');
    }

    console.log(`Sending token ${token.token} to ${request.email}`);

    const result = await this.emailService.sendTotp(request.email, token.token);

    console.log('Sent message', result);

    return {
      id: totpSecret.attrs.id,
      verified: false,
    };
  };

  public verify = async (request: VerifyTotpRequest): Promise<TotpResponse> => {
    let totpSecret = await this.totpSecretModel.model.get(
      TotpSecretModel.prefix('pk', request.id),
      TotpSecretModel.prefix('sk'),
    );

    if (!totpSecret || moment().isAfter(moment(totpSecret.attrs.expires * 1000))) {
      throw new HttpError(400, 'No token has been requested or the token request has expired');
    }

    const verified = twofactor.verifyToken(
      await this.encryptionService.decrypt(totpSecret.attrs.encryptedSecret),
      request.token,
      TOKEN_WINDOW_MINUTES,
    );

    if (!verified) {
      throw new HttpError(400, 'Invalid code');
    }

    // Set expires to now for DynamoDB to vaccuum, shortly
    totpSecret = await this.totpSecretModel.model.update({
      pk: totpSecret.attrs.pk,
      sk: totpSecret.attrs.sk,
      expires: moment().unix(),
    });

    return {
      id: totpSecret.attrs.id,
      verified: true,
    };
  };
}
