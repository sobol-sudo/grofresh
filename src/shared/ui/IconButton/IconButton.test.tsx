import { render } from '@testing-library/react';
import IconButton from './IconButton';

describe('IconButton component', () => {

  // Renders with the default props
  test('renders with default props', () => {
    render(<IconButton />);
  });

  // Renders correctly with the "success" variant
  test('renders with success variant', () => {
    render(<IconButton variant="success" />);
  });

  // Accepts custom styling through the sx prop
  test('renders with custom sx', () => {
    render(<IconButton sx={{ border: '1px solid red' }} />);
  });

  // Renders correctly with a custom size
  test('renders with custom size', () => {
    render(<IconButton size='large' />);
  });

  // Renders its children
  test('renders with children', () => {
    render(<IconButton>Click me</IconButton>);
  });
});
