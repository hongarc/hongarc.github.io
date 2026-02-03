import { Check, Copy } from 'lucide-react';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

type CopyButtonVariant = 'default' | 'ghost' | 'icon';

interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Optional label (only for default/ghost variants) */
  label?: string;
  /** Button style variant */
  variant?: CopyButtonVariant;
  /** Additional CSS classes */
  className?: string;
  /** Callback fired after successful copy (useful for tracking) */
  onCopy?: () => void;
}

const VARIANTS: Record<CopyButtonVariant, { base: string; copied: string; default: string }> = {
  default: {
    base: 'flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-all',
    copied: 'bg-ctp-green/20 text-ctp-green',
    default: 'text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text',
  },
  ghost: {
    base: 'flex cursor-pointer items-center gap-1 rounded p-1 text-xs transition-all',
    copied: 'text-ctp-green',
    default: 'text-ctp-overlay1 hover:text-ctp-text',
  },
  icon: {
    base: 'cursor-pointer rounded p-1.5 transition-all',
    copied: 'text-ctp-green',
    default: 'text-ctp-overlay1 hover:bg-ctp-surface0 hover:text-ctp-text',
  },
};

export function CopyButton({
  text,
  label,
  variant = 'default',
  className = '',
  onCopy,
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard({ onSuccess: onCopy });

  const handleClick = () => {
    void copy(text);
  };

  const styles = VARIANTS[variant];
  const stateClass = copied ? styles.copied : styles.default;

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`${styles.base} ${stateClass} ${className}`}
        title={copied ? 'Copied!' : 'Copy'}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.base} ${stateClass} ${className}`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {label ?? (copied ? 'Copied' : 'Copy')}
    </button>
  );
}
