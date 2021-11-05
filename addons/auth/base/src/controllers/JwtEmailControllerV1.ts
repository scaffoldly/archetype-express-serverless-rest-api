import {
  constructServiceUrl,
  ErrorResponse,
  HttpRequest,
  SERVICE_SLUG,
} from '@scaffoldly/serverless-util';
import { Controller, Post, Response, Body, Request, Res, Route, Tags, TsoaResponse } from 'tsoa';
import { EmailLoginRequest, EmailLoginResponse } from '../interfaces/email';
import { JwtResponse } from '../interfaces/jwt';
import { EmailLoginService } from '../services/EmailLoginService';
import { JwtService } from '../services/JwtService';

@Route('/api/v1/jwts/email')
@Tags('Jwt Email')
export class EmailJwtControllerV1 extends Controller {
  jwtService: JwtService;

  emailLoginService: EmailLoginService;

  constructor() {
    super();
    this.jwtService = new JwtService();
    this.emailLoginService = new EmailLoginService();
  }

  @Post()
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  @Response<EmailLoginResponse, { 'set-cookie'?: string }>(200)
  public async loginWithEmail(
    @Body() request: EmailLoginRequest,
    @Request() httpRequest: HttpRequest,
    @Res()
    res: TsoaResponse<200, JwtResponse, { 'set-cookie'?: string }>,
  ): Promise<EmailLoginResponse> {
    const issuer = constructServiceUrl(
      httpRequest,
      SERVICE_SLUG,
      httpRequest.path.replace(/(.+)(\/.+)$/gm, '$1'),
    );

    let response = await this.emailLoginService.login(request, issuer);

    if (response.payload && request.remember !== false) {
      const refreshCookie = await this.jwtService.createRefreshCookie(
        response.payload,
        httpRequest,
      );
      response = res(200, response, { 'set-cookie': refreshCookie });
    }

    return response;
  }
}
