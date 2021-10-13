import {
  constructServiceUrl,
  ErrorResponse,
  HttpRequest,
  SERVICE_SLUG,
} from '@scaffoldly/serverless-util';
import { Controller, Post, Response, Body, Request, Res, Route, Tags, TsoaResponse } from 'tsoa';
import { JwtEmailRequest, JwtResponse } from '../interfaces/jwt';
import { JwtService } from '../services/JwtService';

@Route('/api/v1/jwts/email')
@Tags('Email Jwt')
export class EmailJwtControllerV1 extends Controller {
  jwtService: JwtService;

  constructor() {
    super();
    this.jwtService = new JwtService();
  }

  @Post()
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  @Response<JwtResponse, { 'set-cookie'?: string }>(200)
  public async loginWithEmail(
    @Body() request: JwtEmailRequest,
    @Request() httpRequest: HttpRequest,
    @Res()
    res: TsoaResponse<200, JwtResponse, { 'set-cookie'?: string }>,
  ): Promise<JwtResponse> {
    const issuer = constructServiceUrl(
      httpRequest,
      SERVICE_SLUG,
      httpRequest.path.replace(/(.+)(\/.+)$/gm, '$1'),
    );

    let jwtResponse = await this.jwtService.emailLogin(request, issuer);
    if (jwtResponse.payload && request.remember) {
      const refreshCookie = await this.jwtService.createRefreshCookie(
        jwtResponse.payload,
        httpRequest,
      );
      jwtResponse = res(200, jwtResponse, { 'set-cookie': refreshCookie });
    }

    return jwtResponse;
  }
}
