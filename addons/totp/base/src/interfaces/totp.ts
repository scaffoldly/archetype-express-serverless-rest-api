export type EmailTotpRequest = {
  email: string;
};

export type VerifyTotpRequest = {
  id: string;
  token: string;
};

export type TotpResponse = {
  id: string;
  verified: boolean;
};
