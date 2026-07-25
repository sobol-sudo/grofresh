import { renderHook, act } from '@testing-library/react';
import useDebounce from './useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('updates the value only after the delay has elapsed', () => {
    let value = 'initial';
    const { result, rerender } = renderHook(() => useDebounce(value));

    expect(result.current).toBe('initial');

    // Change the value
    value = 'updated';
    rerender();

    // debouncedValue has not changed yet
    expect(result.current).toBe('initial');

    // Advance the timer by 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('clears the pending timer when the value changes rapidly', () => {
    let value = 'first';
    const { result, rerender } = renderHook(() => useDebounce(value, 500));

    // Change the value before the delay elapses
    value = 'second';
    rerender();

    act(() => {
      jest.advanceTimersByTime(499); // not elapsed yet
    });
    expect(result.current).toBe('first'); // still the previous value

    act(() => {
      jest.advanceTimersByTime(1); // 500ms have now passed since the last change
    });
    expect(result.current).toBe('second');
  });
});
