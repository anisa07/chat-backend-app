import * as crypto from 'crypto';

const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');
const secretIV = Buffer.from(process.env.SECRET_IV, 'hex');
const encryptionMethod = process.env.ENCRYPTION_METHOD;

const key = crypto
  .createHash('sha512')
  .update(secretKey)
  .digest('hex')
  .substring(0, 32);

// Encrypt data
export function encryptData(data) {
  const cipher = crypto.createCipheriv(encryptionMethod, key, secretIV);
  return Buffer.from(
    cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
  ).toString('base64');
}

// Decrypt data
export function decryptData(encryptedData) {
  const buff = Buffer.from(encryptedData, 'base64');
  const decipher = crypto.createDecipheriv(encryptionMethod, key, secretIV);
  return (
    decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
    decipher.final('utf8')
  );
}
