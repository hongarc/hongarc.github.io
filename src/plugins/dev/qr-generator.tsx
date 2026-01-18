import { Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { useCallback } from 'react';

import type { ToolPlugin, TransformResult } from '@/types/plugin';
import { failure, getSelectInput, getTrimmedInput, instruction, success } from '@/utils';

const MODE_OPTIONS = ['text', 'vietqr'] as const;

// Vietnamese banks for VietQR
const VIETNAM_BANKS = [
  { bin: '970415', name: 'VietinBank', shortName: 'VTB' },
  { bin: '970436', name: 'Vietcombank', shortName: 'VCB' },
  { bin: '970418', name: 'BIDV', shortName: 'BIDV' },
  { bin: '970405', name: 'Agribank', shortName: 'AGR' },
  { bin: '970407', name: 'Techcombank', shortName: 'TCB' },
  { bin: '970423', name: 'TPBank', shortName: 'TPB' },
  { bin: '970432', name: 'VPBank', shortName: 'VPB' },
  { bin: '970422', name: 'MBBank', shortName: 'MBB' },
  { bin: '970416', name: 'ACB', shortName: 'ACB' },
  { bin: '970403', name: 'Sacombank', shortName: 'STB' },
  { bin: '970448', name: 'OCB', shortName: 'OCB' },
  { bin: '970437', name: 'HDBank', shortName: 'HDB' },
  { bin: '970426', name: 'MSB', shortName: 'MSB' },
  { bin: '970441', name: 'VIB', shortName: 'VIB' },
  { bin: '970443', name: 'SHB', shortName: 'SHB' },
  { bin: '970449', name: 'LPBank', shortName: 'LPB' },
  { bin: '970454', name: 'VietCapitalBank', shortName: 'VCCB' },
  { bin: '970429', name: 'SeABank', shortName: 'SEAB' },
  { bin: '970414', name: 'OceanBank', shortName: 'OCB' },
  { bin: '970431', name: 'Eximbank', shortName: 'EIB' },
  { bin: '970428', name: 'NamABank', shortName: 'NAB' },
  { bin: '970406', name: 'DongABank', shortName: 'DAB' },
  { bin: '970439', name: 'PublicBank', shortName: 'PVB' },
  { bin: '970458', name: 'UOB', shortName: 'UOB' },
  { bin: '970400', name: 'SaigonBank', shortName: 'SGB' },
  { bin: '970427', name: 'VietABank', shortName: 'VAB' },
  { bin: '970419', name: 'NCB', shortName: 'NCB' },
  { bin: '970412', name: 'PVcomBank', shortName: 'PVCB' },
  { bin: '970425', name: 'ABBank', shortName: 'ABB' },
  { bin: '970424', name: 'ShinhanBank', shortName: 'SHBVN' },
  { bin: '970462', name: 'KookminBank', shortName: 'KBVN' },
  { bin: '970433', name: 'VietBank', shortName: 'VIETBANK' },
  { bin: '970438', name: 'BaoVietBank', shortName: 'BVB' },
  { bin: '970446', name: 'COOPBANK', shortName: 'COOPBANK' },
  { bin: '970452', name: 'KienLongBank', shortName: 'KLB' },
  { bin: '970440', name: 'CBBank', shortName: 'CBB' },
  { bin: '970457', name: 'Woori', shortName: 'WRB' },
  { bin: '970421', name: 'VRB', shortName: 'VRB' },
  { bin: '546034', name: 'MoMo', shortName: 'MOMO' },
  { bin: '546035', name: 'ZaloPay', shortName: 'ZALOPAY' },
  { bin: '546036', name: 'VNPay', shortName: 'VNPAY' },
] as const;

// Generate VietQR content string
const generateVietQRContent = (
  bankBin: string,
  accountNumber: string,
  amount?: string,
  description?: string,
  accountName?: string
): string => {
  // VietQR uses EMVCo QR Code standard
  // Format: https://www.vietqr.io/portal-service/download/documents/QRCode%20Pay%20Merchant%20Presented%20Mode%20for%20VietQR%20v1.1%20-%20Vietnamese.pdf

  // Build the QR data
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
  merchantInfo += '0010A000000727'; // 00: GUID
  merchantInfo += `01${String(beneficiaryInfo.length).padStart(2, '0')}${beneficiaryInfo}`; // 01: Beneficiary Info
  merchantInfo += '0208QRIBFTTA'; // 02: Service Code

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

// CRC16-CCITT calculation for VietQR (Byte-based)
const calculateCRC16 = (str: string): string => {
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

// Custom QR display component
function QRDisplay({ dataUrl, content }: { dataUrl: string; content: string }) {
  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = dataUrl;
    link.click();
  }, [dataUrl]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <img src={dataUrl} alt="QR Code" className="h-64 w-64" />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDownload}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Download PNG
        </button>
      </div>
      <p className="max-w-md text-center text-xs break-all text-slate-500 dark:text-slate-400">
        {content.length > 100 ? `${content.slice(0, 100)}...` : content}
      </p>
    </div>
  );
}

// Async transformer for QR generation
const generateQR = async (inputs: Record<string, unknown>): Promise<TransformResult> => {
  const mode = getSelectInput(inputs, 'mode', MODE_OPTIONS, 'text');
  const content = getTrimmedInput(inputs, 'content');

  if (mode === 'text') {
    if (!content) {
      return instruction('Please enter text or URL to generate QR code');
    }

    try {
      const dataUrl = await QRCode.toDataURL(content, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });

      return success(content, {
        _viewMode: 'qr',
        _qrData: { dataUrl, content },
        type: 'Text/URL',
        length: content.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'QR generation failed';
      return failure(message);
    }
  }

  // VietQR mode
  const bankBin = getTrimmedInput(inputs, 'bankBin');
  const accountNumber = getTrimmedInput(inputs, 'accountNumber');
  const accountName = getTrimmedInput(inputs, 'accountName');
  const amount = getTrimmedInput(inputs, 'amount');
  const description = getTrimmedInput(inputs, 'description');

  if (!bankBin || !accountNumber) {
    return instruction('Please select a bank and enter account number');
  }

  try {
    const qrContent = generateVietQRContent(
      bankBin,
      accountNumber,
      amount,
      description,
      accountName
    );

    const dataUrl = await QRCode.toDataURL(qrContent, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });

    const bank = VIETNAM_BANKS.find((b) => b.bin === bankBin);

    return success(qrContent, {
      _viewMode: 'qr',
      _qrData: { dataUrl, content: qrContent },
      Bank: bank ? `${bank.name} (${bank.shortName})` : bankBin,
      Account: accountName ? `${accountNumber} (${accountName})` : accountNumber,
      'Account Name': accountName,
      Amount: amount ? `${Number(amount).toLocaleString('vi-VN')} VND` : 'Not specified',
      Message: description,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'QR generation failed';
    return failure(message);
  }
};

export const qrGenerator: ToolPlugin = {
  id: 'qr',
  label: 'QR Code Generator',
  description: 'Generate QR codes for text, URLs, and VietQR bank transfers online',
  category: 'dev',
  icon: <QrCode className="h-4 w-4" />,
  keywords: ['qr', 'code', 'barcode', 'vietqr', 'bank', 'transfer', 'vietnam', 'payment'],
  isAsync: true,
  inputs: [
    {
      id: 'mode',
      label: 'Mode',
      type: 'select',
      defaultValue: 'text',
      options: [
        { value: 'text', label: 'Text / URL' },
        { value: 'vietqr', label: 'Bank Transfer' },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      type: 'textarea',
      placeholder: 'Enter text or URL...',
      rows: 3,
      visibleWhen: { inputId: 'mode', value: 'text' },
      sensitive: true,
    },
    {
      id: 'bankBin',
      label: 'Bank',
      type: 'select',
      defaultValue: '',
      searchable: true,
      options: [
        { value: '', label: 'Select a bank...' },
        ...VIETNAM_BANKS.map((bank) => ({
          value: bank.bin,
          label: `${bank.name} (${bank.shortName})`,
        })),
      ],
      visibleWhen: { inputId: 'mode', value: 'vietqr' },
    },
    {
      id: 'accountNumber',
      label: 'Account Number',
      type: 'text',
      placeholder: 'Enter account number',
      visibleWhen: { inputId: 'mode', value: 'vietqr' },
      sensitive: true,
    },
    {
      id: 'accountName',
      label: 'Account Name',
      type: 'text',
      placeholder: 'Owner name (optional)',
      visibleWhen: { inputId: 'mode', value: 'vietqr' },
      sensitive: true,
    },
    {
      id: 'amount',
      label: 'Amount (VND)',
      type: 'text',
      placeholder: 'Optional - e.g., 100000',
      helpText: 'Leave empty for any amount',
      visibleWhen: { inputId: 'mode', value: 'vietqr' },
      sensitive: true,
    },
    {
      id: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Optional - max 25 characters',
      helpText: 'Transfer description',
      visibleWhen: { inputId: 'mode', value: 'vietqr' },
    },
  ],
  transformer: generateQR,
};

// Export QR display component for use in tool-output
export { QRDisplay };
