import { render, screen, fireEvent } from '@testing-library/react';
import SearchRecently from './SearchRecently';

/**
 * The search box and its recent-searches list.
 *
 * The edit toggle is the interesting part: it only has anything to act on while the
 * list is open, so on a freshly loaded page it used to be a control you could tap
 * forever without seeing anything change.
 */

const renderSearch = (value = '') => {
  const onValueChange = jest.fn();
  render(<SearchRecently value={value} onValueChange={onValueChange} />);
  return { onValueChange };
};

describe('SearchRecently', () => {
  // The list is closed until something opens it
  it('keeps the recent list closed initially', () => {
    renderSearch();

    expect(screen.queryByText('Recent searches')).not.toBeInTheDocument();
  });

  it('opens the list when the input is focused', () => {
    renderSearch();

    fireEvent.focus(screen.getByTestId('input'));

    expect(screen.getByText('Recent searches')).toBeInTheDocument();
  });

  /*
    The fix: edit mode is only visible inside the list, so turning it on has to bring
    the list with it. Without this the icon is a tap that changes nothing on screen.
  */
  it('opens the list when edit mode is switched on', () => {
    renderSearch();

    fireEvent.click(screen.getByTestId('toggle-edit-recent'));

    expect(screen.getByText('Recent searches')).toBeInTheDocument();
    expect(screen.getAllByTestId('ClearIcon').length).toBeGreaterThan(0);
  });

  // The toggle says which state it is in, for anyone who cannot see the crosses
  it('reports its state through aria-pressed', () => {
    renderSearch();

    const toggle = screen.getByTestId('toggle-edit-recent');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAccessibleName('Edit recent searches');

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveAccessibleName('Done editing recent searches');
  });

  // Leaving edit mode puts the delete crosses away again
  it('drops the delete controls when edit mode is switched off', () => {
    renderSearch();

    const toggle = screen.getByTestId('toggle-edit-recent');
    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(screen.queryByTestId('ClearIcon')).not.toBeInTheDocument();
    expect(screen.getByText('Recent searches')).toBeInTheDocument();
  });

  // The delete cross does what it says
  it('removes a recent search', () => {
    renderSearch();

    fireEvent.click(screen.getByTestId('toggle-edit-recent'));

    const before = screen.getAllByTestId('ClearIcon');
    fireEvent.click(before[0]);

    expect(screen.getAllByTestId('ClearIcon')).toHaveLength(before.length - 1);
  });

  // Tapping a row applies it as the query
  it('applies a tapped recent search', () => {
    const { onValueChange } = renderSearch();

    fireEvent.focus(screen.getByTestId('input'));
    fireEvent.click(screen.getByText('Apples'));

    expect(onValueChange).toHaveBeenCalledWith('Apples');
  });

  // In edit mode a row is a thing you are deleting, not a query you are running
  it('does not apply a row while editing', () => {
    const { onValueChange } = renderSearch();

    fireEvent.click(screen.getByTestId('toggle-edit-recent'));
    fireEvent.click(screen.getByText('Apples'));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  // A query with no matching history says so rather than showing an empty box
  it('explains an empty filtered list', () => {
    renderSearch('zzzz');

    fireEvent.focus(screen.getByTestId('input'));

    expect(screen.getByTestId('no-recent')).toHaveTextContent('No recent searches match');
  });
});
