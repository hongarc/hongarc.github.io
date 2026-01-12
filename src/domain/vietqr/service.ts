import { VIETQR_GUID, VIETQR_SERVICE_CODE } from './constants';

export interface VietQRParams {
  bankBin: string;
  accountNumber: string;
  amount?: string;
  description?: string;
  accountName?: string;
}

// CRC16-CCITT calculation for VietQR (Byte-based)
export const calculateCRC16 = (str: string): string => {
  let crc = 0xff_ff;
  const polynomial = 0x10_21;
  const bytes = new TextEncoder().encode(str);

  for (const byte of bytes) {
    for (let j = 0; j < 8; j++) {
      const bit = ((byte >> (7 - j)) & 1) === 1;
      const c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) {
        crc ^= polynomial;
      }
    }
  }

  crc &= 0xff_ff;
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

export const generateVietQRContent = ({
  bankBin,
  accountNumber,
  amount,
  description,
  accountName,
}: VietQRParams): string => {
  let qrData = '';

  // Payload Format Indicator (ID 00)
  qrData += '000201';

  // Point of Initiation Method (ID 01) - 12 = Dynamic QR
  qrData += '010212';

  // Merchant Account Information (ID 38) - VietQR specific
  let beneficiaryInfo = '';
  beneficiaryInfo += `00${String(bankBin.length).padStart(2, '0')}${bankBin}`; // 00: Bank BIN
  beneficiaryInfo += `01${String(accountNumber.length).padStart(2, '0')}${accountNumber}`; // 01: Account Number

  let merchantInfo = '';
  merchantInfo += VIETQR_GUID; // 00: GUID
  merchantInfo += `01${String(beneficiaryInfo.length).padStart(2, '0')}${beneficiaryInfo}`; // 01: Beneficiary Info
  merchantInfo += VIETQR_SERVICE_CODE; // 02: Service Code

  qrData += `38${String(merchantInfo.length).padStart(2, '0')}${merchantInfo}`;

  // Transaction Currency (ID 53) - 704 = VND
  qrData += '5303704';

  // Transaction Amount (ID 54) - optional
  if (amount && Number(amount) > 0) {
    const amountStr = amount;
    qrData += `54${String(amountStr.length).padStart(2, '0')}${amountStr}`;
  }

  // Country Code (ID 58)
  qrData += '5802VN';

  // Beneficiary Name (ID 59) - optional but recommended
  if (accountName) {
    const name = accountName.toUpperCase().slice(0, 25);
    qrData += `59${String(name.length).padStart(2, '0')}${name}`;
  }

  // Additional Data Field Template (ID 62)
  if (description) {
    let additionalData = '';
    const desc = description.slice(0, 50); // EMVCo allows more, but keep reasonable
    additionalData += `08${String(desc.length).padStart(2, '0')}${desc}`;
    qrData += `62${String(additionalData.length).padStart(2, '0')}${additionalData}`;
  }

  // Calculate CRC (ID 63)
  qrData += '6304';

  // CRC16-CCITT calculation
  const crc = calculateCRC16(qrData);
  qrData += crc;

  return qrData;
};
