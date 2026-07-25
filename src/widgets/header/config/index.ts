export const headerConfig = {
  '/': {
    user: true,
    cartIcon: true,
    notificationIcon: true,
  },
  '/categories': {
    backRoute: true,
    centerName: true,
    title: 'Categories',
    cartIcon: true,
  },
  '/products': {
    backRoute: true,
    centerName: true,
    title: 'All products',
    cartIcon: true,
  },
  '/deals': {
    backRoute: true,
    centerName: true,
    title: 'Fresh Deals',
    cartIcon: true,
  },
  '/cart': {
    backRoute: true,
    centerName: true,
    title: 'Cart',
    dots: true,
  },
  '/notifications': {
    backRoute: true,
    centerName: true,
    title: 'Notifications',
  },
  '/orders': {
    backRoute: true,
    centerName: true,
    title: 'Order history',
    cartIcon: true,
  },
  '/profile': {
    backRoute: true,
    centerName: true,
    title: 'Profile',
  },
  '/checkout-success': {
    backRoute: true,
    centerName: true,
    title: 'Payment',
    onDarkBackground: true,
  },
};

export type HeaderRoute = keyof typeof headerConfig;

export type HeaderConfig = {
  user?: boolean;
  cartIcon?: boolean;
  /** The bell. Home only: anywhere else it would sit next to a back arrow and a title. */
  notificationIcon?: boolean;
  backRoute?: boolean;
  centerName?: boolean;
  title?: string;
  /** The cart's overflow menu. It removes itself when there is nothing to clear. */
  dots?: boolean;
  onDarkBackground?: boolean;
};
