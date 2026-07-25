import { useRouter } from "next/router";
import Button from "@/shared/ui/Button";
import { BottomNavBar } from "@/features/bottom-nav-bar";

/**
 * The screen for a URL that does not exist.
 *
 * Worth writing by hand rather than leaving to the framework default: the header is
 * driven by a per-route config, and an unknown route matches no entry, so the default
 * 404 renders under an empty header — no title, no back arrow, no way home that is
 * not the browser's own. Inside Telegram that is a corner with no exit.
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <div className="pt-[38px] h-full">
      <div className="container flex flex-col pb-[33px]">
        <div className="flex flex-col items-center text-center mt-[40px]" data-testid="not-found">
          <div className="flex items-center justify-center w-[90px] h-[90px] rounded-full bg-[var(--color-flash-white)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="#00824B" strokeWidth="1.6" />
              <path d="M20.5 20.5 16 16" stroke="#00824B" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M8.8 8.8l4.4 4.4M13.2 8.8l-4.4 4.4" stroke="#00824B" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>

          <h3 className="h3-bold mt-[22px]">This page does not exist</h3>
          <p className="h6-regular text-gray-500 mt-[7px] max-w-[280px]">
            The link may be out of date. The catalog, your cart and your orders are all
            still where you left them.
          </p>

          <Button
            colorType="success"
            sx={{ height: 50, borderRadius: 50, marginTop: '22px', paddingInline: '28px', textTransform: 'none' }}
            onClick={() => router.push('/')}
          >
            <span className="h5-bold text-white">Back to home</span>
          </Button>
        </div>

        <BottomNavBar className="mt-[40px]" />
      </div>
    </div>
  );
}
