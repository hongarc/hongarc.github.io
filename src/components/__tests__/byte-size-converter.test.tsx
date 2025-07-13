import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ByteSizeConverter from '../byte-size-converter';

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock the converters
jest.mock('../../converters/byte-size-converters', () => ({
  convertByteSize: jest.fn((input: string, format: string) => {
    if (input === '1024') {
      const conversions: Record<string, string> = {
        bytes: '1024',
        kb: '1 KB',
        mb: '0.001 MB',
        gb: '0.000001 GB',
        tb: '0.000000001 TB',
        pb: '0.000000000001 PB',
      };
      return conversions[format] || '0';
    }
    return '0';
  }),
  toBytes: jest.fn((input: string) => {
    if (input === '1024') return 1024;
    if (input === '1KB') return 1024;
    return 0;
  }),
  toHumanReadable: jest.fn((bytes: number) => {
    if (bytes === 1024) return '1 KB';
    return '0 B';
  }),
}));

// Mock the useThrottle hook
jest.mock('../../hooks/use-throttle', () => {
  return jest.fn((callback: Function) => {
    return callback;
  });
});

describe('ByteSizeConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component with header and description', () => {
    render(<ByteSizeConverter />);

    expect(screen.getByText('Byte Size Converter')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Convert between bytes, KB, MB, GB, TB, PB, and human-readable formats/
      )
    ).toBeInTheDocument();
  });

  it('should render input textarea with placeholder', () => {
    render(<ByteSizeConverter />);

    const textarea = screen.getByPlaceholderText(
      'Enter size (e.g., 1024, 1KB, 1.5MB)...'
    );
    expect(textarea).toBeInTheDocument();
  });

  it('should render "Load Example" button', () => {
    render(<ByteSizeConverter />);

    const exampleButton = screen.getByText('Load Example');
    expect(exampleButton).toBeInTheDocument();
  });

  it('should show empty state when no input is provided', () => {
    render(<ByteSizeConverter />);

    expect(
      screen.getByText('Enter a size to see conversions...')
    ).toBeInTheDocument();
  });

  it('should load example when "Load Example" button is clicked', async () => {
    const user = userEvent.setup();
    render(<ByteSizeConverter />);

    const exampleButton = screen.getByText('Load Example');
    await user.click(exampleButton);

    const textarea = screen.getByPlaceholderText(
      'Enter size (e.g., 1024, 1KB, 1.5MB)...'
    );
    expect(textarea).toHaveValue('1024');
  });

  it('should convert input and display results', async () => {
    const user = userEvent.setup();
    render(<ByteSizeConverter />);

    const textarea = screen.getByPlaceholderText(
      'Enter size (e.g., 1024, 1KB, 1.5MB)...'
    );
    await user.type(textarea, '1024');

    // Wait for the conversion to complete
    await waitFor(() => {
      expect(screen.getByText('Bytes')).toBeInTheDocument();
      expect(screen.getByText('KB')).toBeInTheDocument();
      expect(screen.getByText('MB')).toBeInTheDocument();
      expect(screen.getByText('GB')).toBeInTheDocument();
      expect(screen.getByText('TB')).toBeInTheDocument();
      expect(screen.getByText('PB')).toBeInTheDocument();
      expect(screen.getByText('Human-Readable')).toBeInTheDocument();
    });
  });

  it('should display conversion results correctly', async () => {
    const user = userEvent.setup();
    render(<ByteSizeConverter />);

    const textarea = screen.getByPlaceholderText(
      'Enter size (e.g., 1024, 1KB, 1.5MB)...'
    );
    await user.type(textarea, '1024');

    await waitFor(() => {
      expect(screen.getByText('1024')).toBeInTheDocument(); // Bytes
      expect(screen.getByText('1 KB')).toBeInTheDocument(); // KB
      expect(screen.getByText('0.001 MB')).toBeInTheDocument(); // MB
    });
  });

  it('should have copy buttons for each conversion result', async () => {
    const user = userEvent.setup();
    render(<ByteSizeConverter />);

    const textarea = screen.getByPlaceholderText(
      'Enter size (e.g., 1024, 1KB, 1.5MB)...'
    );
    await user.type(textarea, '1024');

    await waitFor(() => {
      const copyButtons = screen.getAllByText('Copy');
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });

  it('should copy text to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    render(<ByteSizeConverter />);

    const textarea = screen.getByPlaceholderText(
      'Enter size (e.g., 1024, 1KB, 1.5MB)...'
    );
    await user.type(textarea, '1024');

    await waitFor(async () => {
      const copyButtons = screen.getAllByText('Copy');
      await user.click(copyButtons[0]);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1024');
    });
  });

  it('should handle input changes correctly', async () => {
    const user = userEvent.setup();
    render(<ByteSizeConverter />);

    const textarea = screen.getByPlaceholderText(
      'Enter size (e.g., 1024, 1KB, 1.5MB)...'
    );
    await user.type(textarea, '2048');

    expect(textarea).toHaveValue('2048');
  });

  it('should clear outputs when input is empty', async () => {
    const user = userEvent.setup();
    render(<ByteSizeConverter />);

    const textarea = screen.getByPlaceholderText(
      'Enter size (e.g., 1024, 1KB, 1.5MB)...'
    );

    // First add some input
    await user.type(textarea, '1024');
    await waitFor(() => {
      expect(screen.getByText('Bytes')).toBeInTheDocument();
    });

    // Then clear the input
    await user.clear(textarea);
    await waitFor(() => {
      expect(
        screen.getByText('Enter a size to see conversions...')
      ).toBeInTheDocument();
    });
  });

  it('should handle error states gracefully', async () => {
    const user = userEvent.setup();
    render(<ByteSizeConverter />);

    const textarea = screen.getByPlaceholderText(
      'Enter size (e.g., 1024, 1KB, 1.5MB)...'
    );
    await user.type(textarea, 'invalid');

    // The component should handle errors gracefully
    await waitFor(() => {
      // Should still render the component without crashing
      expect(screen.getByText('Byte Size Converter')).toBeInTheDocument();
    });
  });

  it('should be accessible with proper labels and roles', () => {
    render(<ByteSizeConverter />);

    const textarea = screen.getByPlaceholderText(
      'Enter size (e.g., 1024, 1KB, 1.5MB)...'
    );
    expect(textarea).toHaveAttribute('role', 'textbox');

    const exampleButton = screen.getByText('Load Example');
    expect(exampleButton).toHaveAttribute('type', 'button');
  });

  it('should have proper keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<ByteSizeConverter />);

    const textarea = screen.getByPlaceholderText(
      'Enter size (e.g., 1024, 1KB, 1.5MB)...'
    );
    const exampleButton = screen.getByText('Load Example');

    // Tab navigation should work
    await user.tab();
    expect(textarea).toHaveFocus();

    await user.tab();
    expect(exampleButton).toHaveFocus();
  });
});
