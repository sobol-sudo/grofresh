import { render, screen } from '@testing-library/react'
import CartIcon from './CartIcon'
import * as hooks from '@/app/providers/store-provider/config/hooks'

// Mock IconButton so the real component is not rendered
// eslint-disable-next-line react/display-name, @typescript-eslint/no-explicit-any
jest.mock('@/shared/ui/IconButton', () => (props: any) => (
  <button {...props} data-testid="icon-button">{props.children}</button>
))

// Mock the cart icon
// eslint-disable-next-line react/display-name
jest.mock('@mui/icons-material/LocalGroceryStore', () => () => <div data-testid="store-icon" />)

describe('CartIcon component', () => {

  // Renders the button and the cart icon
  test('renders the IconButton and the cart icon', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue(0)
    render(<CartIcon />)

    expect(screen.getByTestId('icon-button')).toBeInTheDocument()
    expect(screen.getByTestId('store-icon')).toBeInTheDocument()
  })

  // Shows the cart item count when it is greater than 0
  test('displays correct cart count when > 0', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue(5)
    render(<CartIcon />)

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  // The Badge still renders when the cart count is 0
  test('renders Badge when cart count is 0', () => {
    jest.spyOn(hooks, 'useAppSelector').mockReturnValue(0)
    render(<CartIcon />)

    const button = screen.getByTestId('icon-button')
    const badge = button.querySelector('.MuiBadge-badge')
    expect(badge).toBeInTheDocument()
  })
})
