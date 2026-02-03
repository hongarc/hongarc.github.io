import type { ParsedQRBase, QRTypeStrategy } from '../types';

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

// Export for use in generator
export { VIETNAM_BANKS };

interface ParsedVietQR extends ParsedQRBase {
  type: 'vietqr';
  bankBin: string;
  bankName: string | null;
  accountNumber: string;
  accountName: string | null;
  amount: string | null;
  description: string | null;
}

// Parse EMVCo TLV format
const parseEMVCoTLV = (data: string): Map<string, string> => {
  const result = new Map<string, string>();
  let index = 0;

  while (index < data.length) {
    if (index + 4 > data.length) break;

    const id = data.slice(index, index + 2);
    const length = Number.parseInt(data.slice(index + 2, index + 4), 10);

    if (Number.isNaN(length) || index + 4 + length > data.length) break;

    const value = data.slice(index + 4, index + 4 + length);
    result.set(id, value);
    index += 4 + length;
  }

  return result;
};

export const vietqrStrategy: QRTypeStrategy<ParsedVietQR> = {
  type: 'vietqr',
  label: 'VietQR',
  badge: { bg: 'bg-ctp-green/20', text: 'text-ctp-green' },
  subtitle: 'Bank Transfer',

  canParse: (content) => content.startsWith('000201') && content.includes('A000000727'),

  parse: (content) => {
    try {
      const tlv = parseEMVCoTLV(content);
      const merchantInfo = tlv.get('38');
      let bankBin = '';
      let accountNumber = '';

      if (merchantInfo) {
        const merchantTLV = parseEMVCoTLV(merchantInfo);
        const beneficiaryInfo = merchantTLV.get('01');
        if (beneficiaryInfo) {
          const beneficiaryTLV = parseEMVCoTLV(beneficiaryInfo);
          bankBin = beneficiaryTLV.get('00') ?? '';
          accountNumber = beneficiaryTLV.get('01') ?? '';
        }
      }

      const accountName = tlv.get('59') ?? null;
      const amount = tlv.get('54') ?? null;

      let description: string | null = null;
      const additionalData = tlv.get('62');
      if (additionalData) {
        const additionalTLV = parseEMVCoTLV(additionalData);
        description = additionalTLV.get('08') ?? null;
      }

      const bank = VIETNAM_BANKS.find((b) => b.bin === bankBin);

      return {
        type: 'vietqr',
        bankBin,
        bankName: bank ? `${bank.name} (${bank.shortName})` : null,
        accountNumber,
        accountName,
        amount,
        description,
        raw: content,
      };
    } catch {
      return null;
    }
  },

  render: (parsed) => ({
    rows: [
      ...(parsed.bankName
        ? [{ label: 'Bank', value: parsed.bankName }]
        : parsed.bankBin
          ? [{ label: 'Bank BIN', value: parsed.bankBin, copyable: true }]
          : []),
      ...(parsed.accountNumber
        ? [{ label: 'Account Number', value: parsed.accountNumber, copyable: true }]
        : []),
      ...(parsed.accountName ? [{ label: 'Account Name', value: parsed.accountName }] : []),
      ...(parsed.amount
        ? [{ label: 'Amount', value: `${Number(parsed.amount).toLocaleString('vi-VN')} VND` }]
        : []),
      ...(parsed.description ? [{ label: 'Description', value: parsed.description }] : []),
    ],
    showRaw: true,
  }),
};
