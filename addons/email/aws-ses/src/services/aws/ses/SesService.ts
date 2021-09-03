import { SERVICE_NAME, SES, STAGE } from '@scaffoldly/serverless-util';
import _ from 'lodash';
import { env } from '../../../env';
import { EmailSendResult, EmailService } from '../../interfaces/EmailService';
import { templates } from './templates';

export class SesService implements EmailService {
  constructor(private domain: string) {}

  async sendTotp(email: string, token: string): Promise<EmailSendResult> {
    const ses = await SES();

    const result = await ses
      .sendTemplatedEmail({
        Source: `${env['organization-name']} <no-reply@${this.domain}>`,
        Destination: { ToAddresses: [email] },
        Template: await this.fetchTemplate('totp'),
        TemplateData: JSON.stringify({
          Organization: env['organization-name'],
          OTP: token,
        }),
      })
      .promise();

    return {
      messageId: result.MessageId,
    };
  }

  private async fetchTemplate(name: string) {
    const ses = await SES();

    const templateName = `${name}-${SERVICE_NAME}-${STAGE}`;
    const template = templates[name];
    const source = {
      TemplateName: templateName,
      ...template,
    };

    let templateResponse: AWS.SES.GetTemplateResponse;
    try {
      templateResponse = await ses.getTemplate({ TemplateName: templateName }).promise();
    } catch (e) {
      console.log('Creating template', templateName);
      await ses.createTemplate({ Template: source }).promise();
      templateResponse = await ses.getTemplate({ TemplateName: templateName }).promise();
    }

    if (!_.isEqual(templateResponse.Template, source)) {
      console.log('Updating template', templateName);
      await ses.updateTemplate({ Template: source }).promise();
    }

    if (!templateResponse.Template) {
      throw new Error(`Unable to find template: ${name}`);
    }

    console.log('Using template', templateResponse.Template.TemplateName);
    return templateResponse.Template.TemplateName;
  }
}
