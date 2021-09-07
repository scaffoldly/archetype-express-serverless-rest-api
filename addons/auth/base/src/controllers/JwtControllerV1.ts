import {
  BaseJwtPayload,
  constructServiceUrl,
  ErrorResponse,
  extractRequestToken,
  HttpRequest,
  SERVICE_SLUG,
} from '@scaffoldly/serverless-util';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  Response,
  Route,
  Security,
  Tags,
  TsoaResponse,
} from 'tsoa';
import { JwtResponse, JwtEmailRequest, JwksResponse, TokenRequest } from '../interfaces/jwt';
import { JwtService } from '../services/JwtService';

@Route('/api/v1/jwts')
@Tags('Jwt')
export class JwtControllerV1 extends Controller {
  jwtService: JwtService;

  constructor() {
    super();
    this.jwtService = new JwtService();
  }

  @Get()
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  public async certs(@Request() httpRequest: HttpRequest): Promise<JwksResponse> {
    const issuer = constructServiceUrl(httpRequest, SERVICE_SLUG, httpRequest.path);
    return this.jwtService.getPublicKeys(issuer);
  }

  @Post()
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  public verify(
    @Body() request: TokenRequest,
    @Request() httpRequest: HttpRequest,
  ): Promise<BaseJwtPayload> {
    const issuer = constructServiceUrl(httpRequest, SERVICE_SLUG, httpRequest.path);
    return this.jwtService.verify(request.token, issuer);
  }

  @Get('me')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  @Security('jwt')
  public getPayload(@Request() httpRequest: HttpRequest): Promise<BaseJwtPayload> {
    const issuer = constructServiceUrl(
      httpRequest,
      SERVICE_SLUG,
      httpRequest.path.replace(/(.+)(\/.+)$/gm, '$1'),
    );
    return this.jwtService.verify(extractRequestToken(httpRequest), issuer);
  }

  @Post('email')
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

  @Post('refresh')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX')
  @Response<JwtResponse, { 'set-cookie'?: string }>(200)
  public async refresh(
    @Body() request: TokenRequest,
    @Request() httpRequest: HttpRequest,
    @Res()
    res: TsoaResponse<200, JwtResponse, { 'set-cookie'?: string }>,
  ): Promise<JwtResponse> {
    const issuer = constructServiceUrl(
      httpRequest,
      SERVICE_SLUG,
      httpRequest.path.replace(/(.+)(\/.+)$/gm, '$1'),
    );

    let jwtResponse = await this.jwtService.refresh(request.token, issuer, httpRequest);
    if (jwtResponse.payload) {
      const refreshCookie = await this.jwtService.createRefreshCookie(
        jwtResponse.payload,
        httpRequest,
      );
      jwtResponse = res(200, jwtResponse, { 'set-cookie': refreshCookie });
    }

    return jwtResponse;
  }
}
