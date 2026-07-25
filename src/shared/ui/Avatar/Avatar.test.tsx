import { render } from "@testing-library/react"
import Avatar from "./Avatar"

describe('Avatar component', () => {

  // Renders with the default props
  test('renders with default props', () => {
    render(<Avatar />)
  })

  // Renders correctly with a custom size
  test('renders with custom size', () => {
    render(<Avatar size={100} />)
  })

  // Renders correctly with a custom src
  test('renders with custom src', () => {
    render(<Avatar src="example-path" />)
  })
})
