import { KMS } from '@scaffoldly/serverless-util';
import { EncryptedField } from '../../../models/interfaces';
import { EncryptionService } from '../../interfaces/EncryptionService';

export class KmsService implements EncryptionService {
  constructor(private region?: string) {}

  async encrypt(value: string, keyId?: string): Promise<EncryptedField> {
    const kms = await KMS(this.region);

    const encryptResult = await kms
      .encrypt({ KeyId: keyId || 'alias/aws/lambda', Plaintext: Buffer.from(value, 'utf-8') })
      .promise();

    if (!encryptResult.KeyId) {
      throw new Error('Missing key id in encryption response');
    }

    if (!encryptResult.CiphertextBlob) {
      throw new Error('Missing cyphertext blob in encryption response');
    }

    return {
      keyId: encryptResult.KeyId,
      encryptedValue: encryptResult.CiphertextBlob.toString('base64'),
    };
  }

  async decrypt(encryptedField: EncryptedField): Promise<string> {
    const kms = await KMS(this.region);

    const decryptResult = await kms
      .decrypt({
        KeyId: encryptedField.keyId,
        CiphertextBlob: Buffer.from(encryptedField.encryptedValue, 'base64'),
      })
      .promise();

    if (!decryptResult.Plaintext) {
      throw new Error('Missing plaintext result');
    }

    return decryptResult.Plaintext.toString('utf-8');
  }
}
