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
  Route,{% if auth == true %}
  Security,{% endif %}
  Tags,
} from 'tsoa';
import { {{ EntityRequest }}, {{ EntityResponse }}, {{ EntityListResponse }} } from '../interfaces/{{ entity }}';
import { {{ EntityService }} } from '../services/{{ EntityService }}';

@Route('/api/v1/{{ entity | pluralize }}')
@Tags('{{ Entity }}')
export class {{ Entity }}ControllerV1 extends Controller {
  {{ entityService }}: {{ EntityService }};

  constructor() {
    super();
    this.{{ entityService }} = new {{ EntityService }}();
  }

  @Post()
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX'){% if auth == true %}
  @Security('jwt'){% endif %}
  public create(
    @Body() request: {{ EntityRequest }},
    @Request() httpRequest: HttpRequestWithUser,
  ): Promise<{{ EntityResponse }}> {
    return this.{{ entityService }}.create(request, httpRequest.user);
  }

  @Get()
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX'){% if auth == true %}
  @Security('jwt'){% endif %}
  public list(
    @Request() httpRequest: HttpRequestWithUser,
    @Query('nextPk') nextPk?: string,
    @Query('nextSk') nextSk?: string,
    @Query('limit') limit?: number,
  ): Promise<{{ EntityListResponse }}> {
    return this.{{ entityService }}.list(httpRequest.user, nextPk, nextSk, limit);
  }

  @Get('{{ '{' }}{{ entityId }}{{ '}' }}')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX'){% if auth == true %}
  @Security('jwt'){% endif %}
  public getById(
    @Path('{{ entityId }}') {{ entityId }}: string,
    @Request() httpRequest: HttpRequestWithUser,
  ): Promise<{{ EntityResponse }}> {
    return this.{{ entityService }}.getById({{ entityId }}, httpRequest.user);
  }

  @Patch('{{ '{' }}{{ entityId }}{{ '}' }}')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX'){% if auth == true %}
  @Security('jwt'){% endif %}
  public updateById(
    @Path('{{ entityId }}') {{ entityId }}: string,
    @Body() {{ entityRequest }}: {{ EntityRequest }},
    @Request() httpRequest: HttpRequestWithUser,
  ): Promise<{{ EntityResponse }}> {
    return this.{{ entityService }}.updateById({{ entityId }}, {{ entityRequest }}, httpRequest.user);
  }

  @Delete('{{ '{' }}{{ entityId }}{{ '}' }}')
  @Response<null>('204')
  @Response<ErrorResponse>('4XX')
  @Response<ErrorResponse>('5XX'){% if auth == true %}
  @Security('jwt'){% endif %}
  public deleteById(
    @Path('{{ entityId }}') {{ entityId }}: string,
    @Query('async') async = false,
    @Request() httpRequest: HttpRequestWithUser,
  ): Promise<{{ EntityResponse }} | null> {
    return this.{{ entityService }}.deleteById({{ entityId }}, httpRequest.user, async);
  }
}
