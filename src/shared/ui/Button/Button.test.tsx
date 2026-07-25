import { fireEvent, render } from "@testing-library/react";
import Button from "./Button"

describe('Button component', () => {

  // Renders with the default props
  test('renders with default props', () => {
    render(<Button>Button</Button>);
  });

  // Renders correctly with the "text" variant
  test('renders with variant=text', () => {
    render(<Button variant="text">Button</Button>);
  });

  // Renders correctly with the "outlined" variant
  test('renders with variant=outlined', () => {
    render(<Button variant="outlined">Button</Button>);
  });

  // onClick is forwarded and called
  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    const { getByText } = render(<Button onClick={handleClick}>Button</Button>);

    const button = getByText("Button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // The default no-op onClick is safe to call
  test('default onClick does not throw', () => {
    const { getByText } = render(<Button>Button</Button>);
    const button = getByText("Button");

    expect(() => fireEvent.click(button)).not.toThrow();
  });
})
