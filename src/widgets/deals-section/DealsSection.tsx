import { useRouter } from "next/router";
import {
  Product,
  selectDiscountedProducts,
  selectMaxDiscountPercent,
} from "@/entities/product";
import { pluralize } from "@/shared/lib/pluralize";
import Button from "@/shared/ui/Button";

/**
 * Everything currently on promotion, behind "Explore deals" on the home banner.
 *
 * The banner used to advertise a sale that led nowhere and, worse, that no price in
 * the app reflected. Both halves of that are fixed by deriving from one place: the
 * products carry the discount, `discountedPrice` turns it into the price on the card
 * and the price in the cart total, and this screen is simply the products that carry
 * one. The count and the headline percent below are read off that same list, so the
 * banner, this header and the grid cannot state three different sales.
 */
export default function DealsSection() {
  const router = useRouter();

  const deals = selectDiscountedProducts();
  const maxPercent = selectMaxDiscountPercent();

  // Nothing on offer is a real state, not an error: say so rather than render an
  // empty grid under a header promising savings.
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center text-center mt-[40px]" data-testid="deals-empty">
        <div className="flex items-center justify-center w-[90px] h-[90px] rounded-full bg-[var(--color-flash-white)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M4 12.5V5.5A1.5 1.5 0 0 1 5.5 4h7l7.5 7.5-7 7L4 12.5Z"
              stroke="#00824B"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="8.75" cy="8.75" r="1.25" fill="#00824B" />
          </svg>
        </div>

        <h4 className="h4-bold mt-[22px]">No deals running right now</h4>
        <p className="h6-regular text-gray-500 mt-[7px] max-w-[280px]">
          Prices are back to normal. The full catalog is still one tap away.
        </p>

        <Button
          colorType="success"
          sx={{ height: 50, borderRadius: 50, marginTop: '22px', paddingInline: '28px', textTransform: 'none' }}
          onClick={() => router.push('/products')}
        >
          <span className="h5-bold text-white">Browse all products</span>
        </Button>
      </div>
    );
  }

  return (
    <div data-testid="deals-grid">
      <div className="flex items-baseline justify-between gap-2.5">
        <p className="small-regular text-gray-500" data-testid="deals-count">
          {pluralize(deals.length, 'product')} on offer
        </p>

        <span className="small-bold text-[var(--color-green-500)]" data-testid="deals-headline">
          Up to {maxPercent}% off
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2.5 mt-[22px]">
        {deals.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
