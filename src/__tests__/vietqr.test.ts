import { describe, expect, it } from 'vitest';

import { generateVietQRContent } from '../domain/vietqr/service';

import { VietQRDataBuilder } from './builders/vietqr-builder';

describe('VietQR Service', () => {
  it('should generate valid QR data', () => {
    const data = new VietQRDataBuilder()
      .withBank('970415')
      .withAccount('123456789')
      .withAmount(50_000)
      .withMessage('Payment test')
      .build();

    const result = generateVietQRContent(data);
    expect(result).toContain('000201'); // Payload Format Indicator
    expect(result).toContain('010212'); // Point of Initiation Method
    expect(result).toContain('00069704150109123456789'); // Consumer Account Information part
    expect(result).toContain('540550000'); // Transaction Amount
    expect(result).toContain('62160812Payment test'); // Additional Data Field Template
  });
});
