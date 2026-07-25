import { render, fireEvent } from '@testing-library/react';
import { useClickOutside, UseClickOutsideOptions } from './useClickOutside';
import { useRef } from 'react';

// Helper component used to exercise the hook
function TestComponent({ callback, options }: { callback: () => void; options?: UseClickOutsideOptions }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref as React.RefObject<HTMLElement>, callback, options);
  return <div ref={ref}>Inside</div>;
}

describe('useClickOutside', () => {
  it('calls the callback when clicking outside the element', () => {
    const callback = jest.fn();
    const { getByText } = render(<TestComponent callback={callback} />);

    // click outside the element
    fireEvent.mouseDown(document);
    expect(callback).toHaveBeenCalled();

    callback.mockClear();

    // click inside the element
    fireEvent.mouseDown(getByText('Inside'));
    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call the callback when clicking inside the element', () => {
    const callback = jest.fn();
    const { getByText } = render(<TestComponent callback={callback} />);

    fireEvent.mouseDown(getByText('Inside'));
    expect(callback).not.toHaveBeenCalled();
  });

  it('works with doubleEvent: true for dblclick', () => {
    const callback = jest.fn();
    render(<TestComponent callback={callback} options={{ doubleEvent: true }} />);

    fireEvent.dblClick(document);
    expect(callback).toHaveBeenCalled();
  });

    it('does not call the callback on a plain click event', () => {
    const callback = jest.fn();
    render(<TestComponent callback={callback} options={{ doubleTapDelay: 300 }} />);

    fireEvent.click(document);
    expect(callback).not.toHaveBeenCalled();
  });



  it('works with doubleEvent: true for a double-tap on touch', () => {
    jest.useFakeTimers();
    const callback = jest.fn();
    const doubleTapDelay = 300
    render(<TestComponent callback={callback} options={{ doubleEvent: true, doubleTapDelay}} />);

    const touchEvent = new TouchEvent('touchstart', { bubbles: true });
    document.dispatchEvent(touchEvent);
    jest.advanceTimersByTime(doubleTapDelay - 100);
    document.dispatchEvent(touchEvent);

    expect(callback).toHaveBeenCalled();
    jest.useRealTimers(); 
  });

    it('works with doubleEvent: true for a double-tap on touch without an explicit doubleTapDelay', () => {
    jest.useFakeTimers();
    const callback = jest.fn();
    const doubleTapDelay = 300
    render(<TestComponent callback={callback} options={{ doubleEvent: true}} />);

    const touchEvent = new TouchEvent('touchstart', { bubbles: true });
    document.dispatchEvent(touchEvent);
    jest.advanceTimersByTime(doubleTapDelay - 100);
    document.dispatchEvent(touchEvent);

    expect(callback).toHaveBeenCalled();
    jest.useRealTimers(); 
  });

  it('does not call the callback on the first touch', () => {
    jest.useFakeTimers();
    const callback = jest.fn();
    render(<TestComponent callback={callback} options={{ doubleEvent: true, doubleTapDelay: 300 }} />);

    const touchEvent = new TouchEvent('touchstart', { bubbles: true });
    document.dispatchEvent(touchEvent);

    expect(callback).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});
