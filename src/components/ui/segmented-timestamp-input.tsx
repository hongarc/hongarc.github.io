import { useSegmentedInput } from '@/hooks/use-segmented-input';

interface SegmentedTimestampInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

export function SegmentedTimestampInput({
  id,
  value,
  onChange,
  placeholder,
  hasError = false,
}: SegmentedTimestampInputProps) {
  const { inputRef, handlers } = useSegmentedInput({ value, onChange });

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      value={value}
      readOnly
      placeholder={placeholder}
      {...handlers}
      className={`bg-ctp-mantle border-ctp-surface1 text-ctp-text placeholder:text-ctp-overlay0 focus:border-ctp-blue focus:ring-ctp-blue/20 w-full cursor-text rounded-lg border px-3 py-2 font-mono text-sm focus:ring-2 focus:outline-none ${
        hasError ? 'border-ctp-red' : ''
      }`}
    />
  );
}
