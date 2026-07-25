export const headerConfig = {
  '/': {
    user: true,
    cartIcon: true,
  },
  '/cart': {
    backRoute: true,
    centerName: true,
    title: 'Cart',
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
  backRoute?: boolean;
  centerName?: boolean;
  title?: string;
  onDarkBackground?: boolean;
};
