import Image from 'next/image'
import Link from 'next/link'
import { selectDiscountedProducts, selectMaxDiscountPercent } from '@/entities/product'
import { pluralize } from '@/shared/lib/pluralize'

interface DiscountCardProps {
  className?: string;
}

/**
 * The "Fresh Deals" banner.
 *
 * Every claim on it is read out of the catalog rather than written into the markup:
 * the headline percent is the largest discount any product actually carries, and the
 * subtitle counts the products carrying one. A hardcoded "20% OFF" is a promise the
 * data can quietly stop keeping.
 *
 * The same rule decides whether the banner exists at all — with nothing on offer there
 * is no sale to advertise and no screen worth opening, so it renders nothing.
 */
export default function DiscountCard({ className }: DiscountCardProps) {
  const maxPercent = selectMaxDiscountPercent();
  const dealCount = selectDiscountedProducts().length;

  if (maxPercent === 0 || dealCount === 0) return null;

  return (
    <div className={className}>
      <div className="relative bg-green-500 w-full rounded-[30px] p-4 pb-[71px] flex flex-col text-white overflow-hidden">
        <h3 className="h3-bold">Fresh Deals <br />
          Today {maxPercent}% OFF
        </h3>
        <span className="small-regular mt-2.5" data-testid="discount-card-subtitle">
          Special prices on {pluralize(dealCount, 'grocery', 'groceries')}
        </span>

        {/*
          The banner leads to the products it is talking about. It is a link rather
          than a button so it behaves like navigation, and it is only ever rendered
          alongside a non-empty offer, so it cannot open an empty screen.
        */}
        <Link
          href="/deals"
          className="relative z-20 mt-[15px] w-fit rounded-[10px] bg-white px-[18px] py-[9px] h5-bold text-[var(--color-green-500)]"
          data-testid="explore-deals"
        >
          Explore deals
        </Link>

        <Image
          src='/images/product-discount.png'
          width={130}
          height={130}
          className="absolute right-0 bottom-0 object-contain z-10"
          priority
          alt="Picture of the author" />

        <div className="absolute size-[100px] -right-[25px] -top-[25px] bg-white opacity-15 rounded-full"></div>
        <div className="absolute size-[100px] right-[25px] -top-[45px] bg-white opacity-15 rounded-full"></div>
      </div>
    </div>

  )
}
