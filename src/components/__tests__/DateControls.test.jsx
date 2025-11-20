import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DateControls from '../DateControls';

describe('DateControls Component', () => {
  const defaultProps = {
    referenceDate: '2023-10-15',
    onReferenceDateChange: vi.fn(),
    timeWindowYears: 5,
    onTimeWindowYearsChange: vi.fn(),
    minEventYear: 2000,
    maxEventYear: 2024,
    onMinEventYearChange: vi.fn(),
    onMaxEventYearChange: vi.fn(),
  };

  it('should render correctly with given props', () => {
    render(<DateControls {...defaultProps} />);

    expect(screen.getByLabelText(/Data de Referência/i)).toHaveValue('2023-10-15');
    expect(screen.getByLabelText(/Janela de Tempo/i)).toHaveValue(5);
    expect(screen.getByLabelText(/Ano mínimo do slider/i)).toHaveValue(2000);
    expect(screen.getByLabelText(/Ano máximo do slider/i)).toHaveValue(2024);
  });

  it('should call onReferenceDateChange when date input changes', () => {
    render(<DateControls {...defaultProps} />);
    const dateInput = screen.getByLabelText(/Data de Referência/i);

    fireEvent.change(dateInput, { target: { value: '2022-01-01' } });

    expect(defaultProps.onReferenceDateChange).toHaveBeenCalledWith('2022-01-01');
  });

  it('should call onTimeWindowYearsChange when time window input changes', () => {
    render(<DateControls {...defaultProps} />);
    const timeWindowInput = screen.getByLabelText(/Janela de Tempo/i);

    fireEvent.change(timeWindowInput, { target: { value: '10' } });

    expect(defaultProps.onTimeWindowYearsChange).toHaveBeenCalledWith(10);
  });

  it('should call onMinEventYearChange when min year input changes', () => {
    render(<DateControls {...defaultProps} />);
    const minYearInput = screen.getByLabelText(/Ano mínimo do slider/i);

    fireEvent.change(minYearInput, { target: { value: '1990' } });

    expect(defaultProps.onMinEventYearChange).toHaveBeenCalledWith(1990);
  });

  it('should call onMaxEventYearChange when max year input changes', () => {
    render(<DateControls {...defaultProps} />);
    const maxYearInput = screen.getByLabelText(/Ano máximo do slider/i);

    fireEvent.change(maxYearInput, { target: { value: '2030' } });

    expect(defaultProps.onMaxEventYearChange).toHaveBeenCalledWith(2030);
  });

  it('should call onReferenceDateChange when slider changes', () => {
      render(<DateControls {...defaultProps} />);
      // Slider logic:
      // sliderMinMonths = 0
      // sliderMaxMonths = (2024 - 2000) * 12 + 11 = 299
      // current value for 2023-10: (2023 - 2000) * 12 + 9 = 285

      // Let's move to 2000-01-15.
      // Offset = 0.
      // Expected date: 2000-01-15

      const slider = screen.getByRole('slider'); // The range input is effectively a slider

      fireEvent.change(slider, { target: { value: '0' } });

      expect(defaultProps.onReferenceDateChange).toHaveBeenCalledWith('2000-01-15');
  });
});
