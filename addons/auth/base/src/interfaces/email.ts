import { JwtRequest, JwtResponse } from './jwt';

export type EmailLoginRequest = JwtRequest & {
  email: string;
  code?: string;
};

export type EmailLoginResponse = JwtResponse & {
  verificationSentTo?: string;
};
