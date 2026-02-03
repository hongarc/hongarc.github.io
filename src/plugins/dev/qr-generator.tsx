import jsQR from 'jsqr';
import { Download, QrCode, ScanLine, Upload } from 'lucide-react';
import QRCode from 'qrcode';
import { useCallback, useRef, useState } from 'react';

import type { ToolPlugin } from '@/types/plugin';
import { success } from '@/utils';

import { VIETNAM_BANKS } from './qr-types';
import { DecodedResult } from './qr-types/decoded-result';

type MainMode = 'generate' | 'decode';
type GenerateMode = 'text' | 'vietqr';

// CRC16-CCITT calculation for VietQR
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

// Generate VietQR content string
const generateVietQRContent = (
  bankBin: string,
  accountNumber: string,
  amount?: string,
  description?: string,
  accountName?: string
): string => {
  let qrData = '';
  qrData += '000201';
  qrData += '010212';

  let beneficiaryInfo = '';
  beneficiaryInfo += `00${String(bankBin.length).padStart(2, '0')}${bankBin}`;
  beneficiaryInfo += `01${String(accountNumber.length).padStart(2, '0')}${accountNumber}`;

  let merchantInfo = '';
  merchantInfo += '0010A000000727';
  merchantInfo += `01${String(beneficiaryInfo.length).padStart(2, '0')}${beneficiaryInfo}`;
  merchantInfo += '0208QRIBFTTA';

  qrData += `38${String(merchantInfo.length).padStart(2, '0')}${merchantInfo}`;
  qrData += '5303704';

  if (amount && Number(amount) > 0) {
    qrData += `54${String(amount.length).padStart(2, '0')}${amount}`;
  }

  qrData += '5802VN';

  if (accountName) {
    const name = accountName.toUpperCase().slice(0, 25);
    qrData += `59${String(name.length).padStart(2, '0')}${name}`;
  }

  if (description) {
    let additionalData = '';
    const desc = description.slice(0, 50);
    additionalData += `08${String(desc.length).padStart(2, '0')}${desc}`;
    qrData += `62${String(additionalData.length).padStart(2, '0')}${additionalData}`;
  }

  qrData += '6304';
  qrData += calculateCRC16(qrData);

  return qrData;
};

// Decode QR from image file
const decodeQRFromFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      const img = new Image();

      img.addEventListener('load', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          resolve(code.data);
        } else {
          reject(new Error('No QR code found in image'));
        }
      });

      img.addEventListener('error', () => {
        reject(new Error('Failed to load image'));
      });

      img.src = reader.result as string;
    });

    reader.addEventListener('error', () => {
      reject(new Error('Failed to read file'));
    });

    reader.readAsDataURL(file);
  });
};

// Styles
const INPUT_CLASS =
  'bg-ctp-mantle border-ctp-surface1 text-ctp-text placeholder:text-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none';

const TAB_CLASS = (active: boolean) =>
  `flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
    active
      ? 'bg-ctp-blue text-ctp-base'
      : 'text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text'
  }`;

function QRToolComponent() {
  // Main mode: generate or decode
  const [mainMode, setMainMode] = useState<MainMode>('generate');

  // Generate state
  const [generateMode, setGenerateMode] = useState<GenerateMode>('text');
  const [content, setContent] = useState('');
  const [bankBin, setBankBin] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrContent, setQrContent] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Decode state
  const [decodedContent, setDecodedContent] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate QR code
  const handleGenerate = useCallback(async () => {
    setGenerateError(null);
    setQrDataUrl(null);
    setQrContent(null);

    try {
      let qrData: string;

      if (generateMode === 'text') {
        if (!content.trim()) {
          setGenerateError('Please enter text or URL');
          return;
        }
        qrData = content;
      } else {
        if (!bankBin || !accountNumber.trim()) {
          setGenerateError('Please select a bank and enter account number');
          return;
        }
        qrData = generateVietQRContent(bankBin, accountNumber, amount, description, accountName);
      }

      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 512,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'M',
      });

      setQrDataUrl(dataUrl);
      setQrContent(qrData);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'QR generation failed');
    }
  }, [generateMode, content, bankBin, accountNumber, accountName, amount, description]);

  // Handle file selection for decode
  const handleFileSelect = useCallback(async (file: File) => {
    setDecodeError(null);
    setDecodedContent(null);
    setIsDecoding(true);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const decoded = await decodeQRFromFile(file);
      setDecodedContent(decoded);
    } catch (error) {
      setDecodeError(error instanceof Error ? error.message : 'Decode failed');
    } finally {
      setIsDecoding(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith('image/')) {
        void handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDropZoneKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrDataUrl;
    link.click();
  }, [qrDataUrl]);

  return (
    <div className="space-y-4">
      {/* Main Mode Tabs */}
      <div className="bg-ctp-surface0 flex gap-1 rounded-xl p-1">
        <button
          type="button"
          className={TAB_CLASS(mainMode === 'generate')}
          onClick={() => {
            setMainMode('generate');
          }}
        >
          <QrCode className="mr-2 inline h-4 w-4" />
          Generate
        </button>
        <button
          type="button"
          className={TAB_CLASS(mainMode === 'decode')}
          onClick={() => {
            setMainMode('decode');
          }}
        >
          <ScanLine className="mr-2 inline h-4 w-4" />
          Decode
        </button>
      </div>

      {/* Generate Mode */}
      {mainMode === 'generate' && (
        <div className="space-y-4">
          {/* Generate Type Tabs */}
          <div className="bg-ctp-mantle flex gap-1 rounded-lg p-1">
            <button
              type="button"
              className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                generateMode === 'text'
                  ? 'bg-ctp-surface1 text-ctp-text'
                  : 'text-ctp-subtext0 hover:text-ctp-text'
              }`}
              onClick={() => {
                setGenerateMode('text');
              }}
            >
              Text / URL
            </button>
            <button
              type="button"
              className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                generateMode === 'vietqr'
                  ? 'bg-ctp-surface1 text-ctp-text'
                  : 'text-ctp-subtext0 hover:text-ctp-text'
              }`}
              onClick={() => {
                setGenerateMode('vietqr');
              }}
            >
              VietQR
            </button>
          </div>

          {/* Text/URL Input */}
          {generateMode === 'text' && (
            <div>
              <label
                htmlFor="qr-content"
                className="text-ctp-subtext1 mb-1.5 block text-sm font-medium"
              >
                Content
              </label>
              <textarea
                id="qr-content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
                placeholder="Enter text or URL..."
                rows={3}
                className={`${INPUT_CLASS} resize-y`}
              />
            </div>
          )}

          {/* VietQR Inputs */}
          {generateMode === 'vietqr' && (
            <>
              <div>
                <label
                  htmlFor="qr-bank"
                  className="text-ctp-subtext1 mb-1.5 block text-sm font-medium"
                >
                  Bank
                </label>
                <select
                  id="qr-bank"
                  value={bankBin}
                  onChange={(e) => {
                    setBankBin(e.target.value);
                  }}
                  className={`${INPUT_CLASS} cursor-pointer`}
                >
                  <option value="">Select a bank...</option>
                  {VIETNAM_BANKS.map((bank) => (
                    <option key={bank.bin} value={bank.bin}>
                      {bank.name} ({bank.shortName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="qr-account"
                    className="text-ctp-subtext1 mb-1.5 block text-sm font-medium"
                  >
                    Account Number
                  </label>
                  <input
                    id="qr-account"
                    type="text"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                    }}
                    placeholder="Enter account number"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label
                    htmlFor="qr-name"
                    className="text-ctp-subtext1 mb-1.5 block text-sm font-medium"
                  >
                    Account Name
                  </label>
                  <input
                    id="qr-name"
                    type="text"
                    value={accountName}
                    onChange={(e) => {
                      setAccountName(e.target.value);
                    }}
                    placeholder="Owner name (optional)"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="qr-amount"
                    className="text-ctp-subtext1 mb-1.5 block text-sm font-medium"
                  >
                    Amount (VND)
                  </label>
                  <input
                    id="qr-amount"
                    type="text"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                    }}
                    placeholder="Optional"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label
                    htmlFor="qr-desc"
                    className="text-ctp-subtext1 mb-1.5 block text-sm font-medium"
                  >
                    Description
                  </label>
                  <input
                    id="qr-desc"
                    type="text"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                    }}
                    placeholder="Optional"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </>
          )}

          {/* Generate Button */}
          <button
            type="button"
            onClick={() => {
              void handleGenerate();
            }}
            className="bg-ctp-blue text-ctp-base hover:bg-ctp-blue/90 w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Generate QR Code
          </button>

          {/* Error */}
          {generateError && <p className="text-ctp-red text-sm">{generateError}</p>}

          {/* QR Result */}
          {qrDataUrl && (
            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700">
                <img src={qrDataUrl} alt="QR Code" className="h-64 w-64" />
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </button>
              {qrContent && (
                <p className="text-ctp-subtext0 max-w-md text-center text-xs break-all">
                  {qrContent.length > 100 ? `${qrContent.slice(0, 100)}...` : qrContent}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Decode Mode */}
      {mainMode === 'decode' && (
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            role="button"
            tabIndex={0}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onClick={handleDropZoneClick}
            onKeyDown={handleDropZoneKeyDown}
            className="border-ctp-surface2 bg-ctp-mantle hover:border-ctp-blue hover:bg-ctp-surface0 focus:border-ctp-blue focus:ring-ctp-blue/20 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors focus:ring-2 focus:outline-none"
          >
            <Upload className="text-ctp-overlay1 mb-3 h-10 w-10" />
            <p className="text-ctp-text text-sm font-medium">
              Drop an image here or click to upload
            </p>
            <p className="text-ctp-subtext0 mt-1 text-xs">Supports PNG, JPG, GIF, WebP</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileSelect(file);
              }}
              className="hidden"
            />
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="QR Preview"
                className="border-ctp-surface1 max-h-48 rounded-lg border"
              />
            </div>
          )}

          {/* Loading */}
          {isDecoding && (
            <div className="text-ctp-subtext1 flex items-center justify-center gap-2 py-4">
              <div className="border-ctp-blue h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              Decoding...
            </div>
          )}

          {/* Decode Error */}
          {decodeError && <p className="text-ctp-red text-center text-sm">{decodeError}</p>}

          {/* Decoded Result - uses Strategy Pattern */}
          {decodedContent && <DecodedResult content={decodedContent} />}
        </div>
      )}
    </div>
  );
}

export const qrGenerator: ToolPlugin = {
  id: 'qr',
  label: 'QR Code Tool',
  description: 'Generate and decode QR codes for text, URLs, and VietQR bank transfers',
  category: 'dev',
  icon: <QrCode className="h-4 w-4" />,
  keywords: [
    'qr',
    'code',
    'barcode',
    'vietqr',
    'bank',
    'transfer',
    'vietnam',
    'payment',
    'decode',
    'scan',
    'read',
    'wifi',
  ],
  inputs: [],
  transformer: () => success(''),
  customComponent: QRToolComponent,
};
