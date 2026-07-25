# Grofresh

Grofresh is a mobile-first storefront for a grocery-delivery service — browse categories, add items to a cart, and go through a checkout flow, in the spirit of Instacart, Getir or Gorillas. It is a frontend project: product data is mocked in the repository and there is no backend. What it is really about is the architecture — a Next.js and TypeScript codebase organised with Feature-Sliced Design, Redux Toolkit for state, and Jest tests colocated with the code they cover.

<img width="728" height="833" alt="Grofresh home screen and cart" src="https://github.com/user-attachments/assets/778b7bb8-cc36-474a-8b11-9eb311a23958" />

Live demo: **[grofresh.vercel.app](https://grofresh.vercel.app)**

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 15 (Pages Router), Turbopack for dev and build |
| Language | TypeScript 5.9, `strict` enabled |
| UI | React 19, MUI 7, Tailwind CSS v4 |
| State | Redux Toolkit 2.9 with typed `useAppSelector` / `useAppDispatch` hooks |
| Animation | GSAP, Lottie (`@lottiefiles/dotlottie-react`) |
| Testing | Jest 30, React Testing Library, jsdom |
| Linting | ESLint 9 flat config (`next/core-web-vitals`, `next/typescript`) |
| Architecture | Feature-Sliced Design |

## Features

- **Catalog** — 9 categories in a horizontally scrollable strip and a "Popular now" product grid, backed by 17 mock products.
- **Search with recent queries** — debounced input, filtering over a recent-searches list, an edit mode for deleting entries, click-outside dismissal, and GSAP enter/exit transitions.
- **Cart** — add and remove items, per-item quantity increment and decrement (an item is dropped at zero), with counts and totals derived through Redux selectors.
- **Add-to-cart modal** — opens on product selection with a quantity counter; "Buy now" routes straight to the cart in checkout mode.
- **Checkout** — entry points for a discount code and payment method, mock saved cards, a last-used card, and an order summary with a fixed service fee folded into the total.
- **Order confirmation** — a dedicated success screen with a Lottie payment animation and payment details.
- **Telegram Mini App support** — when the app is opened inside Telegram, the `useTelegram` hook reads the WebApp user and renders their name and avatar in the header, falling back to a guest state everywhere else. WebApp types are declared in `src/types/telegram-webapp.d.ts`.
- **Route-aware header** — a per-route config decides which controls the header renders: user block, back button, cart icon, notifications.

## Getting started

Requires Node.js 18.18 or newer.

```bash
git clone https://github.com/sobol-sudo/grofresh.git
cd grofresh
npm install
npm run dev
```

The dev server runs at `http://localhost:3000`.

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build (Turbopack) |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Jest suite; coverage is collected into `coverage/` |
| `npm run test:watch` | Run Jest in watch mode |

Tests live next to the code they cover — 24 test files across slices, hooks, UI primitives and widgets. Reducer logic is tested directly, components through React Testing Library.

## Project structure

The codebase follows [Feature-Sliced Design](https://feature-sliced.design/). Layers are ordered by responsibility and imports only ever point downwards: a layer may use the layers below it, never the ones above. Each slice exposes its public API through an `index.ts`, so slices within the same layer stay independent.

```
src/
├── app/        Providers and global styles - Redux store provider, MUI theme, CSS layers
├── pages/      Route entries: /, /cart, /checkout-success
├── widgets/    Composite page sections: header, cart section, popular now, browse category
├── features/   User-facing actions: add to cart, recent search, bottom navigation
├── entities/   Domain models and their UI: product, cart, payment
└── shared/     Reusable UI kit, hooks, theme and helpers - no domain knowledge
```

`src/pages` does double duty here: it is both the Next.js Pages Router directory and the FSD pages layer, so route files stay thin and delegate to widgets. Imports use the `@/*` alias mapped to `src/*`.

## Scope

This is a UI project, deliberately. There is no backend, no authentication and no persistence — catalog and payment data are fixtures, and state resets on reload.
