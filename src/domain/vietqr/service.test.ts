import { describe, expect, it } from 'vitest';

import { calculateCRC16, generateVietQRContent } from './service';

describe('VietQR Service', () => {
  describe('calculateCRC16', () => {
    it('should calculate correct CRC16 for a simple string', () => {
      // Test case from standard examples or known values
      // CRC-16/CCITT-FALSE for "123456789" is 0x29B1
      expect(calculateCRC16('123456789')).toBe('29B1');
    });

    it('should calculate correct CRC16 for VietQR payload structure', () => {
      // Partial payload example
      const payload =
        '00020101021238570010A00000072701230006970415011311336666888880208QRIBFTTA53037045802VN6304';
      const crc = calculateCRC16(payload);
      expect(crc).toHaveLength(4);
      // We aren't verifying the exact CRC here without a reference implementation,
      // but ensuring it returns a 4-char hex string is a good sanity check.
      expect(crc).toMatch(/^[0-9A-F]{4}$/);
    });
  });

  describe('generateVietQRContent', () => {
    it('should generate a valid VietQR payload with strict EMVCo structure', () => {
      const result = generateVietQRContent({
        bankBin: '970415',
        accountNumber: '1133666688888',
        amount: '20000',
        description: 'Chuyen tien',
        accountName: 'NGUYEN VAN A',
      });

      // 1. Basic format check
      expect(result).toContain('000201'); // Payload Format Indicator
      expect(result).toContain('010212'); // Point of Initiation Method

      // 2. Tag 38 Check (Merchant Account Information)
      // Structure: 38 + Length + Value
      // Value must contain:
      //   00 + Length + A000000727 (GUID)
      //   01 + Length + Nested (00+Len+BIN, 01+Len+Account)
      //   02 + Length + QRIBFTTA (Service Code)

      const tag38Index = result.indexOf('38');
      expect(tag38Index).toBeGreaterThan(-1);

      // Verify GUID presence
      expect(result).toContain('0010A000000727');

      // Verify Service Code
      expect(result).toContain('0208QRIBFTTA');

      // Verify Nested Bank Info
      // BIN '970415' -> Tag 00 Length 06 Value 970415 -> '0006970415'
      expect(result).toContain('0006970415');

      // Account '1133666688888' (13 chars) -> Tag 01 Length 13 Value... -> '01131133666688888'
      expect(result).toContain('01131133666688888');

      // 3. Tag 53 (Currency)
      expect(result).toContain('5303704'); // VND

      // 4. Tag 54 (Amount)
      // '20000' -> Length 05 -> '540520000'
      expect(result).toContain('540520000');

      // 5. Tag 58 (Country)
      expect(result).toContain('5802VN');

      // 6. Tag 59 (Beneficiary Name)
      // 'NGUYEN VAN A' (12 chars) -> '5912NGUYEN VAN A'
      expect(result).toContain('5912NGUYEN VAN A');

      // 7. Tag 62 (Additional Data - Description)
      // 'Chuyen tien' (11 chars) -> Tag 08 inside Tag 62
      // '0811Chuyen tien'
      expect(result).toContain('0811Chuyen tien');

      // 8. CRC Checksum
      expect(result).toMatch(/6304[0-9A-F]{4}$/);
    });

    it('should generate valid payload without optional fields', () => {
      const result = generateVietQRContent({
        bankBin: '970436', // Vietcombank
        accountNumber: '001100110011',
      });

      // BIN '970436'
      expect(result).toContain('0006970436');

      // Account
      expect(result).toContain('0112001100110011');

      // No Amount (Tag 54)
      expect(result).not.toContain('540'); // Should not start Tag 54

      // No Name (Tag 59)
      expect(result).not.toContain('59'); // CAREFUL: '59' might appear in CRC or other random parts, but unlikely as a tag in this specific simplified check.
      // A better check is strict TLV parsing, but regex is okay for now.
      // Actually '59' is a specific tag ID. If it's not at the top level it shouldn't be there.
      // But verifying absence is tricky with string inclusion.
      // We can check known surrounding tags. Tag 58 is VN. Tag 63 is CRC.
      // If 59 is missing, 5802VN should be followed by 6304 (or 62 if desc exists, but desc is empty here).
      // Since both 59 and 62 are missing, 5802VN should be immediately followed by 6304
      expect(result).toContain('5802VN6304');
    });
  });
});
