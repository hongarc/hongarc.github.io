import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ColorConverter from '../color-converter';

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock the converters
jest.mock('../../converters/color-converters', () => ({
  convertColor: jest.fn((input: string, format: string) => {
    if (input === '#ff0000') {
      const conversions: Record<string, string> = {
        hex: '#ff0000',
        rgb: 'rgb(255, 0, 0)',
        rgba: 'rgba(255, 0, 0, 1)',
        hsl: 'hsl(0, 100%, 50%)',
        hsla: 'hsla(0, 100%, 50%, 1)',
        hsv: 'hsv(0, 100%, 100%)',
        cmyk: 'cmyk(0, 100, 100, 0)',
      };
      return conversions[format] || '#ff0000';
    }
    return '#ff0000';
  }),
}));

// Mock the useThrottle hook
jest.mock('../../hooks/use-throttle', () => {
  return jest.fn((callback: Function) => {
    return callback;
  });
});

describe('ColorConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component with header and description', () => {
    render(<ColorConverter />);

    expect(screen.getByText('Color Converter')).toBeInTheDocument();
    expect(
      screen.getByText(/Convert between different color formats/)
    ).toBeInTheDocument();
  });

  it('should render color input with placeholder', () => {
    render(<ColorConverter />);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );
    expect(colorInput).toBeInTheDocument();
  });

  it('should render "Load Example" button', () => {
    render(<ColorConverter />);

    const exampleButton = screen.getByText('Load Example');
    expect(exampleButton).toBeInTheDocument();
  });

  it('should show empty state when no input is provided', () => {
    render(<ColorConverter />);

    expect(
      screen.getByText('Enter a color to see conversions...')
    ).toBeInTheDocument();
  });

  it('should load example when "Load Example" button is clicked', async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const exampleButton = screen.getByText('Load Example');
    await user.click(exampleButton);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );
    expect(colorInput).toHaveValue('#ff0000');
  });

  it('should convert input and display results', async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );
    await user.type(colorInput, '#ff0000');

    // Wait for the conversion to complete
    await waitFor(() => {
      expect(screen.getByText('HEX')).toBeInTheDocument();
      expect(screen.getByText('RGB')).toBeInTheDocument();
      expect(screen.getByText('RGBA')).toBeInTheDocument();
      expect(screen.getByText('HSL')).toBeInTheDocument();
      expect(screen.getByText('HSLA')).toBeInTheDocument();
      expect(screen.getByText('HSV')).toBeInTheDocument();
      expect(screen.getByText('CMYK')).toBeInTheDocument();
    });
  });

  it('should display conversion results correctly', async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );
    await user.type(colorInput, '#ff0000');

    await waitFor(() => {
      expect(screen.getByText('#ff0000')).toBeInTheDocument(); // HEX
      expect(screen.getByText('rgb(255, 0, 0)')).toBeInTheDocument(); // RGB
      expect(screen.getByText('rgba(255, 0, 0, 1)')).toBeInTheDocument(); // RGBA
    });
  });

  it('should have copy buttons for each conversion result', async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );
    await user.type(colorInput, '#ff0000');

    await waitFor(() => {
      const copyButtons = screen.getAllByText('Copy');
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });

  it('should copy text to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );
    await user.type(colorInput, '#ff0000');

    await waitFor(async () => {
      const copyButtons = screen.getAllByText('Copy');
      await user.click(copyButtons[0]);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#ff0000');
    });
  });

  it('should handle input changes correctly', async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );
    await user.type(colorInput, '#00ff00');

    expect(colorInput).toHaveValue('#00ff00');
  });

  it('should clear outputs when input is empty', async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );

    // First add some input
    await user.type(colorInput, '#ff0000');
    await waitFor(() => {
      expect(screen.getByText('HEX')).toBeInTheDocument();
    });

    // Then clear the input
    await user.clear(colorInput);
    await waitFor(() => {
      expect(
        screen.getByText('Enter a color to see conversions...')
      ).toBeInTheDocument();
    });
  });

  it('should handle error states gracefully', async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );
    await user.type(colorInput, 'invalid-color');

    // The component should handle errors gracefully
    await waitFor(() => {
      // Should still render the component without crashing
      expect(screen.getByText('Color Converter')).toBeInTheDocument();
    });
  });

  it('should be accessible with proper labels and roles', () => {
    render(<ColorConverter />);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );
    expect(colorInput).toHaveAttribute('type', 'text');

    const exampleButton = screen.getByText('Load Example');
    expect(exampleButton).toHaveAttribute('type', 'button');
  });

  it('should have proper keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );
    const exampleButton = screen.getByText('Load Example');

    // Tab navigation should work
    await user.tab();
    expect(colorInput).toHaveFocus();

    await user.tab();
    expect(exampleButton).toHaveFocus();
  });

  it('should show color preview when valid color is entered', async () => {
    const user = userEvent.setup();
    render(<ColorConverter />);

    const colorInput = screen.getByPlaceholderText(
      'Enter color (e.g., #ff0000, rgb(255,0,0))...'
    );
    await user.type(colorInput, '#ff0000');

    await waitFor(() => {
      // The color preview should be visible
      const colorPreview = document.querySelector(
        '[style*="background-color: rgb(255, 0, 0)"]'
      );
      expect(colorPreview).toBeInTheDocument();
    });
  });
});
