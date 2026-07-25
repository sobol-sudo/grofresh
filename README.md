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

- **Catalog** — 5 categories in a horizontally scrollable strip and a product grid, backed by 17 mock products. Selecting a category filters the grid and is reflected in the URL (`/?category=3`), so a filtered view survives a reload and can be shared.
- **Browse screens** — the home page is a teaser: it shows the first 8 products, and "See all" opens `/products` with the whole catalog. A second "See all" opens `/categories`, which lays out every category with the number of products it holds and taps through into the same `?category=` filter. Both links are rendered only when there is something behind them, and both screens have their own empty state.
- **Deals** — the seven fresh-produce items carry a 20% discount. The home banner reads both the size of the sale and the number of products in it off the catalog instead of hardcoding them, and "Explore deals" opens `/deals` with exactly those products. One function turns a discount into money, so the price on the card, the price struck through beside it and the price the cart charges cannot disagree. With nothing on offer the banner does not render and the screen explains itself rather than showing an empty grid.
- **Search** — a debounced query filters the product grid by name and composes with the category filter, with an explicit empty state when nothing matches. The input also keeps a recent-searches list with an edit mode for deleting entries, click-outside dismissal, and GSAP enter/exit transitions.
- **Cart** — add and remove items, per-item quantity increment and decrement (an item is dropped at zero), with counts and totals derived through Redux selectors. An overflow menu in the header empties the whole cart behind a confirmation step, and removes itself when there is nothing left to clear.
- **Add-to-cart modal** — opens on product selection with a quantity counter; "Buy now" routes straight to the cart in checkout mode. Dismissed by a click outside, the close button or Escape.
- **Checkout** — a two-step flow ("Proceed to checkout", then "Place order"), an inline picker over the mock saved cards, a last-used card, and an order summary with a fixed service fee folded into the total.
- **Order confirmation** — placing an order snapshots the cart, empties it and replaces the route, so the purchase cannot be repeated with the Back button. The success screen renders a Lottie animation and a receipt built entirely from that order; opening it without one redirects to the catalog.
- **Notifications** — placing an order is the only thing that produces one, so the header bell's badge counts real unread entries and is absent entirely at zero. `/notifications` lists them newest first, keeps the "new" markers of whatever was waiting when you arrived, and has its own empty state.
- **Profile** — `/profile` shows the Telegram identity alongside numbers counted out of the stored history: orders placed, notifications, and a summary of the most recent order. Every figure waits for storage to be read rather than flashing a zero.
- **Telegram Mini App support** — when the app is opened inside Telegram, the `useTelegram` hook reads the WebApp user and renders their name and avatar in the header and on the profile, falling back to an explicit guest state everywhere else. WebApp types are declared in `src/types/telegram-webapp.d.ts`.
- **App shell** — a per-route config decides which controls the header renders: user block, back button with a title, cart icon, notification bell, cart overflow menu. Every route has an entry, so no screen arrives without a title and a way back. The tab bar sits on the home, cart, notifications, profile and not-found screens, and its active tab is read from the route rather than from local state.
- **Not found** — an unknown URL matches no header entry, which would otherwise leave the framework default sitting under an empty header with no way out. `/404` is written by hand instead: it says what happened and offers the catalog and the tab bar.

## Getting started

Requires Node.js 20 or newer.

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

Tests live next to the code they cover — 52 test files across slices, hooks, UI primitives and widgets. Reducer logic is tested directly, components through React Testing Library. Route-level tests sit in `src/__tests__`, outside `src/pages`, because anything under `pages/` is treated as a route.

A recurring theme in the suite is that a control has to lead somewhere and a number has to be counted rather than typed. Those are asserted, not assumed: the deals banner is rendered against catalogs it does not have to prove its headline follows the data, the "See all" links are only offered when something is genuinely held back, and the cart total is checked against the price shown on the card.

## Project structure

The codebase follows [Feature-Sliced Design](https://feature-sliced.design/). Layers are ordered by responsibility and imports only ever point downwards: a layer may use the layers below it, never the ones above. Each slice exposes its public API through an `index.ts`, so slices within the same layer stay independent.

```
src/
├── app/        Providers and global styles - Redux store provider, MUI theme, CSS layers
├── pages/      Route entries: /, /categories, /products, /deals, /cart, /checkout-success, /notifications, /profile, /404
├── widgets/    Composite page sections: header, cart section, popular now, browse category, product catalog, deals section, discount card, notification list, profile section
├── features/   User-facing actions: add to cart, recent search, bottom navigation, cart menu
├── entities/   Domain models and their UI: product, cart, payment, order, notification
└── shared/     Reusable UI kit, hooks, theme and helpers - no domain knowledge
```

`src/pages` does double duty here: it is both the Next.js Pages Router directory and the FSD pages layer, so route files stay thin and delegate to widgets. Imports use the `@/*` alias mapped to `src/*`.

## Scope

This is a UI project, deliberately. There is no backend and no authentication — the catalog and the saved cards are fixtures. Order history and notifications are the only things that outlive a reload, and they live in this browser's `localStorage`: they are a record of what you did in the demo, not an account.
