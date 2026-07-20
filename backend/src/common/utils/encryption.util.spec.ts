import { EncryptionUtil } from './encryption.util';

describe('EncryptionUtil', () => {
  it('round-trips text with a key of any length (not just 32 chars)', () => {
    process.env.ENCRYPTION_KEY = 'a-secret-of-arbitrary-length-not-32-chars';
    const encrypted = EncryptionUtil.encrypt('1234567890123');
    expect(EncryptionUtil.decrypt(encrypted)).toBe('1234567890123');
  });

  it('hash is deterministic, unlike encrypt (which uses a random IV)', () => {
    process.env.ENCRYPTION_KEY = 'a-secret-of-arbitrary-length-not-32-chars';
    expect(EncryptionUtil.hash('1234567890123')).toBe(EncryptionUtil.hash('1234567890123'));
    expect(EncryptionUtil.encrypt('1234567890123')).not.toBe(EncryptionUtil.encrypt('1234567890123'));
  });

  it('hash differs for different plaintext', () => {
    process.env.ENCRYPTION_KEY = 'a-secret-of-arbitrary-length-not-32-chars';
    expect(EncryptionUtil.hash('1234567890123')).not.toBe(EncryptionUtil.hash('1234567890124'));
  });
});
