import { JwtRequest, JwtResponse } from '../../interfaces/jwt';

export interface LoginService<T extends JwtRequest, K extends JwtResponse> {
  login(request: T, issuer: string): Promise<K>;
}
