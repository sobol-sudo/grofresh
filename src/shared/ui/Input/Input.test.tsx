import { fireEvent, render, screen } from "@testing-library/react"
import Input from "./Input"

describe('Input component', () => {

  const valueExample = 'test'
  const handleChange = jest.fn()

  beforeEach(() => {
    handleChange.mockClear();
  });

  // Renders the value it is given and reacts to changes
  test('renders with default props and value', () => {
    render(<Input value={valueExample} handleChange={handleChange} />);

    // The input shows the correct value
    const input = screen.getByDisplayValue(valueExample);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(valueExample);

    // Changing the value calls handleChange
    fireEvent.change(input, { target: { value: "new value" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
})
