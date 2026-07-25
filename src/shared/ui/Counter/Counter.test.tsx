import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

describe('Counter component', () => {
  const quantity = 5;
  const handleChange = jest.fn();

  beforeEach(() => {
    handleChange.mockClear();
  });

  // Renders the current quantity
  test('renders the current quantity', () => {
    render(<Counter quantity={quantity} handleChange={handleChange} />);
    expect(screen.getByTestId('counter-quantity')).toBeInTheDocument();
  });

  // Clicking the decrement button calls handleChange with "decrease"
  test('clicking decrement button calls handleChange with "decrease"', () => {
    render(<Counter quantity={quantity} handleChange={handleChange} />);
    fireEvent.click(screen.getByTestId('btn-decrease'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('decrease');
  });

  // Clicking the increment button calls handleChange with "increment"
  test('clicking increment button calls handleChange with "increment"', () => {
    render(<Counter quantity={quantity} handleChange={handleChange} />);
    fireEvent.click(screen.getByTestId('btn-increment'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('increment');
  });

  describe.each([
    ['small', '14'],
    ['medium', '17'],
    ['large', '19'],
  ])('renders correct SVG size for %s', (size, expectedSize) => {
    test(`btnSize="${size}" sets SVG size to ${expectedSize}`, () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Counter quantity={quantity} btnSize={size as any} handleChange={handleChange} />);

      const incrementSvg = screen.getByTestId('btn-increment').querySelector('svg');
      const decrementSvg = screen.getByTestId('btn-decrease').querySelector('svg');

      expect(incrementSvg).toHaveAttribute('width', expectedSize);
      expect(incrementSvg).toHaveAttribute('height', expectedSize);
      expect(decrementSvg).toHaveAttribute('width', expectedSize);
      expect(decrementSvg).toHaveAttribute('height', expectedSize);
    });
  });

});
