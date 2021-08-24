import { ErrorResponse, HttpRequestWithUser } from '@scaffoldly/serverless-util';
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Query,
  Request,
  Response,
  Route,{% if auth-service == true %}
  Security,{% endif %}
  Tags,
} from 'tsoa';
import { {{ entity | pascal_case }}Request, {{ entity | pascal_case }}Response, {{ entity | pascal_case }}ListResponse } from '../interfaces/{{ entity | lower_case }}';
import { {{ entity | pascal_case }}Service } from '../services/{{ entity | pascal_case }}Service';

@Route('/api/v1/{{ entity | pluralize | lower_case }}')
@Tags('{{ entity | pascal_case }}')
export class {{ entity | pascal_case }}ControllerV1 extends Controller {
  {{ entity | lower_case }}Service: {{ entity | pascal_case }}Service;

  constructor() {
    super();
    this.{{ entity | lower_case }}Service = new {{ entity | pascal_case }}Service();
  }

  @Post()
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX'){% if auth-service == true %}
  @Security('jwt'){% endif %}
  public create(
    @Body() request: {{ entity | pascal_case }}Request,
    @Request() httpRequest: HttpRequestWithUser,
  ): Promise<{{ entity | pascal_case }}Response> {
    return this.{{ entity | lower_case }}Service.create(request, httpRequest.user);
  }

  @Get()
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX'){% if auth-service == true %}
  @Security('jwt'){% endif %}
  public list(
    @Request() httpRequest: HttpRequestWithUser,
    @Query('nextPk') nextPk?: string,
    @Query('nextSk') nextSk?: string,
    @Query('limit') limit?: number,
  ): Promise<{{ entity | pascal_case }}ListResponse> {
    return this.{{ entity | lower_case }}Service.list(httpRequest.user, nextPk, nextSk, limit);
  }

  @Get('{{ '{' }}{{ entity | lower_case }}Id{{ '}' }}')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX'){% if auth-service == true %}
  @Security('jwt'){% endif %}
  public getById(
    @Path('{{ entity | lower_case }}Id') {{ entity | lower_case }}Id: string,
    @Request() httpRequest: HttpRequestWithUser,
  ): Promise<{{ entity | pascal_case }}Response> {
    return this.{{ entity | lower_case }}Service.getById({{ entity | lower_case }}Id, httpRequest.user);
  }

  @Patch('{{ '{' }}{{ entity | lower_case }}Id{{ '}' }}')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX'){% if auth-service == true %}
  @Security('jwt'){% endif %}
  public updateById(
    @Path('{{ entity | lower_case }}Id') {{ entity | lower_case }}Id: string,
    @Body() {{ entity | lower_case }}Request: {{ entity | pascal_case }}Request,
    @Request() httpRequest: HttpRequestWithUser,
  ): Promise<{{ entity | pascal_case }}Response> {
    return this.{{ entity | lower_case }}Service.updateById({{ entity | lower_case }}Id, {{ entity | lower_case }}Request, httpRequest.user);
  }

  @Delete('{{ '{' }}{{ entity | lower_case }}Id{{ '}' }}')
  @Response<null>('204')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX'){% if auth-service == true %}
  @Security('jwt'){% endif %}
  public deleteById(
    @Path('{{ entity | lower_case }}Id') {{ entity | lower_case }}Id: string,
    @Query('async') async = false,
    @Request() httpRequest: HttpRequestWithUser,
  ): Promise<{{ entity | pascal_case }}Response | null> {
    return this.{{ entity | lower_case }}Service.deleteById({{ entity | lower_case }}Id, httpRequest.user, async);
  }
}
