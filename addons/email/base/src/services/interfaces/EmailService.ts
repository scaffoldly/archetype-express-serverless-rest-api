export type EmailSendResult = {
  messageId: string;
};

export interface EmailService {
  sendTotp(email: string, token: string): Promise<EmailSendResult>;
}

export const isEmail = (value: string): boolean => {
  const email = (value || '').trim();
  if (email.length === 0) {
    return false;
  }
  const split = email.split('@');
  if (split.length < 2) {
    return false;
  }
  const [domain] = split.slice(-1);
  if (domain.indexOf('.') === -1) {
    return false;
  }

  return true;
};
