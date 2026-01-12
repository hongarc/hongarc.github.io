import { describe, expect, it } from 'vitest';

import {
  base64UrlDecode,
  base64UrlEncode,
  getExpiryInfo,
  parseJwtParts,
  signHMAC,
  verifyHMAC,
} from '../domain/jwt/service';

describe('JWT Domain', () => {
  describe('Base64URL', () => {
    it('should encode string to base64url', () => {
      // "Hello World" -> "SGVsbG8gV29ybGQ=" (Base64) -> "SGVsbG8gV29ybGQ" (Base64URL)
      expect(base64UrlEncode('Hello World')).toBe('SGVsbG8gV29ybGQ');
    });

    it('should decode base64url to string', () => {
      expect(base64UrlDecode('SGVsbG8gV29ybGQ')).toBe('Hello World');
    });

    it('should handle special characters', () => {
      // "Subject?" -> "U3ViamVjdD8=" -> "U3ViamVjdD8"
      expect(base64UrlEncode('Subject?')).toBe('U3ViamVjdD8');
      expect(base64UrlDecode('U3ViamVjdD8')).toBe('Subject?');
    });
  });

  describe('HMAC Signing & Verification', () => {
    const secret = 'secret-key';
    const data = 'header.payload';

    it('should sign and verify SHA-256', async () => {
      const signature = await signHMAC(data, secret, 'SHA-256');
      expect(signature).toBeTruthy();

      const isValid = await verifyHMAC(data, signature, secret, 'SHA-256');
      expect(isValid).toBe(true);
    });

    it('should fail verification with wrong secret', async () => {
      const signature = await signHMAC(data, secret, 'SHA-256');
      const isValid = await verifyHMAC(data, signature, 'wrong-key', 'SHA-256');
      expect(isValid).toBe(false);
    });

    it('should fail verification with manipulated data', async () => {
      const signature = await signHMAC(data, secret, 'SHA-256');
      const isValid = await verifyHMAC('header.payload-tampered', signature, secret, 'SHA-256');
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Parsing', () => {
    it('should parse valid JWT parts', () => {
      // Mock token: header.payload.signature
      const header = '{"alg":"HS256"}';
      const payload = '{"sub":"123"}';
      const token = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.signature`;

      const result = parseJwtParts(token);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.header).toBe(header);
        expect(result.payload).toBe(payload);
        expect(result.signature).toBe('signature');
      }
    });

    it('should return null for invalid token format', () => {
      expect(parseJwtParts('invalid.token')).toBeNull();
      expect(parseJwtParts('part1.part2.part3.part4')).toBeNull();
    });
  });

  describe('Expiry Info', () => {
    it('should return "No expiry" if exp is missing', () => {
      const info = getExpiryInfo({});
      expect(info.isExpired).toBe(false);
      expect(info.text).toBe('No expiry');
    });

    it('should detect expired token', () => {
      const past = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const info = getExpiryInfo({ exp: past });
      expect(info.isExpired).toBe(true);
      expect(info.text).toContain('Expired');
    });

    it('should detect valid token', () => {
      const future = Math.floor(Date.now() / 1000) + 3600; // 1 hour future
      const info = getExpiryInfo({ exp: future });
      expect(info.isExpired).toBe(false);
      expect(info.text).toContain('Expires in');
    });
  });
});
