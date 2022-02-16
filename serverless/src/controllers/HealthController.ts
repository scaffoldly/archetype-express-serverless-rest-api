import { Controller, Get, Route, Tags } from 'tsoa';
import packageJson from '../../package.json';

export type HealthResponse = {
  name: string;
  healthy: boolean;
  now: Date;
  version: string;
};

@Route('/api/health')
@Tags('Health')
export class HealthController extends Controller {
  @Get()
  public async get(): Promise<HealthResponse> {
    return {
      name: packageJson.name,
      healthy: true,
      now: new Date(),
      version: packageJson.version,
    };
  }
}
