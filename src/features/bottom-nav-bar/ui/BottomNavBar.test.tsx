import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import BottomNavBar from './BottomNavBar';

/**
 * The tab bar.
 *
 * Every tab here has to move the app to a route that exists — the bar it replaced kept
 * its selection in local state, so pressing a tab recoloured an icon and did nothing
 * else. There are three tabs and not four: see the Report note at the bottom.
 */

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const ACTIVE = '#00824B';
const INACTIVE = '#000';

const renderNav = (pathname: string) => {
  (usePathname as jest.Mock).mockReturnValue(pathname);
  return render(<BottomNavBar />);
};

const iconFill = (label: string) =>
  screen.getByRole('button', { name: label }).querySelector('svg')?.getAttribute('fill');

describe('BottomNavBar', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it('offers exactly the tabs that have a screen behind them', () => {
    renderNav('/');

    expect(screen.getAllByRole('button')).toHaveLength(3);
    ['Home', 'Cart', 'Profile'].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it.each([
    ['Home', '/'],
    ['Cart', '/cart'],
    ['Profile', '/profile'],
  ])('sends %s to %s', (label, route) => {
    renderNav('/');

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(push).toHaveBeenCalledWith(route);
  });

  it.each([
    ['/', 'Home'],
    ['/cart', 'Cart'],
    ['/profile', 'Profile'],
  ])('marks the tab matching %s as the current page', (pathname, activeLabel) => {
    renderNav(pathname);

    ['Home', 'Cart', 'Profile'].forEach((label) => {
      const button = screen.getByRole('button', { name: label });
      const isActive = label === activeLabel;

      if (isActive) {
        expect(button).toHaveAttribute('aria-current', 'page');
      } else {
        expect(button).not.toHaveAttribute('aria-current');
      }

      expect(iconFill(label)).toBe(isActive ? ACTIVE : INACTIVE);
    });
  });

  // The active tab is read off the route, so the bar cannot disagree with the page.
  it('highlights nothing on a route without a tab', () => {
    renderNav('/notifications');

    ['Home', 'Cart', 'Profile'].forEach((label) => {
      expect(iconFill(label)).toBe(INACTIVE);
      expect(screen.getByRole('button', { name: label })).not.toHaveAttribute('aria-current');
    });
  });

  /**
   * Deliberately absent. A Report tab would have to be backed by something, and the
   * only material available is the same order history the Profile tab already counts:
   * a handful of orders placed minutes apart in a demo with no backend and no seed
   * data. Any chart drawn over that is one bar wide. Seeding orders to make it look
   * like analytics would be inventing records, which is the thing this app is being
   * cleaned up for.
   */
  it('has no Report tab', () => {
    renderNav('/');

    expect(screen.queryByRole('button', { name: /report/i })).not.toBeInTheDocument();
  });
});
