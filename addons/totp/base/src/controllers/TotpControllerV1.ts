import { ErrorResponse } from '@scaffoldly/serverless-util';
import { Body, Controller, Post, Response, Route, Tags } from 'tsoa';
import { EmailTotpRequest, TotpResponse, VerifyTotpRequest } from '../interfaces/totp';
import { TotpService } from '../services/TotpService';

@Route('/api/v1/totps')
@Tags('Totp')
export class TotpControllerV1 extends Controller {
  totpService: TotpService;

  constructor() {
    super();
    this.totpService = new TotpService();
  }

  @Post('email')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  public emailTotp(@Body() request: EmailTotpRequest): Promise<TotpResponse> {
    return this.totpService.sendEmail(request);
  }

  @Post('verify')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  public verify(@Body() request: VerifyTotpRequest): Promise<TotpResponse> {
    return this.totpService.verify(request);
  }
}
