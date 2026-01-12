import { Download } from 'lucide-react';
import { useCallback } from 'react';

import type { OutputStrategyProps } from './types';

// Extracted from ToolOutput
function QRDisplay({
  dataUrl,
  content,
  meta,
}: {
  dataUrl: string;
  content: string;
  meta: Record<string, unknown>;
}) {
  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = dataUrl;
    link.click();
  }, [dataUrl]);

  // Check if it's a VietQR transfer (has bank info)
  const isTransfer = !!meta.Bank || !!meta.Account;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {/* VietQR Header Style */}
        {isTransfer && (
          <div className="bg-blue-600 px-6 py-3 text-center text-white">
            <h3 className="font-semibold">Scan to Pay</h3>
          </div>
        )}

        <div className="p-6 text-center">
          <img src={dataUrl} alt="QR Code" className="mx-auto h-64 w-64" />
        </div>

        {/* Amount (if present) */}
        {!!meta.Amount && meta.Amount !== 'Not specified' && (
          <div className="border-t border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Amount</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {String(meta.Amount as string | number)}
            </p>
          </div>
        )}

        {/* Transfer Details */}
        {isTransfer && (
          <div className="space-y-2 border-t border-slate-200 p-4 text-sm dark:border-slate-700">
            {!!meta.Bank && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Bank</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {meta.Bank as string}
                </span>
              </div>
            )}
            {!!meta.Account && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Account No.</span>
                <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                  {meta.Account as string | number}
                </span>
              </div>
            )}
            {!!meta['Account Name'] && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Account Name</span>
                <span className="font-medium text-slate-900 uppercase dark:text-slate-100">
                  {meta['Account Name'] as string}
                </span>
              </div>
            )}
            {!!meta.Message && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Message</span>
                <span className="max-w-[180px] text-right font-medium break-words text-slate-900 dark:text-slate-100">
                  {meta.Message as string}
                </span>
              </div>
            )}
          </div>
        )}
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

      {!isTransfer && (
        <p className="max-w-md text-center text-xs break-all text-slate-500 dark:text-slate-400">
          {content.length > 100 ? `${content.slice(0, 100)}...` : content}
        </p>
      )}
    </div>
  );
}

export function QRStrategy({ result, meta }: OutputStrategyProps) {
  const qrData = result.meta?._qrData as { dataUrl: string; content: string } | undefined;

  if (!qrData) return null;

  return <QRDisplay dataUrl={qrData.dataUrl} content={qrData.content} meta={meta} />;
}
