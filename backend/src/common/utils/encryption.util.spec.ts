import { EncryptionUtil } from './encryption.util';

describe('EncryptionUtil', () => {
  it('round-trips text with a key of any length (not just 32 chars)', () => {
    process.env.ENCRYPTION_KEY = 'a-secret-of-arbitrary-length-not-32-chars';
    const encrypted = EncryptionUtil.encrypt('1234567890123');
    expect(EncryptionUtil.decrypt(encrypted)).toBe('1234567890123');
  });
});
