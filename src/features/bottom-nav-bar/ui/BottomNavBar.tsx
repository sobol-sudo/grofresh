import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

type BottomNavBarProps = React.HTMLAttributes<HTMLDivElement>

export default function BottomNavBar({ className = "", ...props }: BottomNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // The active tab follows the route, so the bar cannot disagree with the page you are on.
  const iconColor = (route: string) => (pathname === route ? "#00824B" : "#000");

  return (
    <nav
      className={`flex items-center gap-[15px] shadow rounded-[50px] bg-white p-[20px_20px_37px_20px] ${className}`}
      {...props}
    >
      {/* Home */}
      <button
        className="w-full flex justify-center cursor-pointer"
        aria-label="Home"
        aria-current={pathname === '/' ? 'page' : undefined}
        onClick={() => router.push('/')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill={iconColor('/')} xmlns="http://www.w3.org/2000/svg">
          <path d="M19.5 8.19094V2.25H15.75V4.98984L12 1.5L0 12.75H3V22.5H9.75V15H14.25V22.5H21V12.75H24L19.5 8.19094Z" />
        </svg>
      </button>
      {/* Cart */}
      <button
        className="w-full flex justify-center cursor-pointer"
        aria-label="Cart"
        aria-current={pathname === '/cart' ? 'page' : undefined}
        onClick={() => router.push('/cart')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill={iconColor('/cart')} xmlns="http://www.w3.org/2000/svg">
          <path d="M3.75 3C3.55109 3 3.36032 3.07902 3.21967 3.21967C3.07902 3.36032 3 3.55109 3 3.75C3 3.94891 3.07902 4.13968 3.21967 4.28033C3.36032 4.42098 3.55109 4.5 3.75 4.5H4.119C4.28186 4.50028 4.4402 4.55357 4.57009 4.6518C4.69999 4.75003 4.79438 4.88788 4.839 5.0445L7.218 13.3695C7.35255 13.8393 7.63641 14.2525 8.02665 14.5467C8.41689 14.8409 8.8923 15 9.381 15H16.2345C16.6843 15.0001 17.1237 14.8654 17.4962 14.6132C17.8686 14.3611 18.157 14.0031 18.324 13.5855L20.535 8.0565C20.6259 7.82899 20.6597 7.58268 20.6334 7.3391C20.6071 7.09551 20.5216 6.86208 20.3842 6.65919C20.2469 6.4563 20.062 6.29014 19.8456 6.17523C19.6292 6.06032 19.388 6.00015 19.143 6H6.672L6.2805 4.632C6.14629 4.16216 5.86277 3.74878 5.47281 3.45434C5.08285 3.15991 4.60763 3.00043 4.119 3H3.75ZM9.75 21C10.0455 21 10.3381 20.9418 10.611 20.8287C10.884 20.7157 11.1321 20.5499 11.341 20.341C11.5499 20.1321 11.7157 19.884 11.8287 19.611C11.9418 19.3381 12 19.0455 12 18.75C12 18.4545 11.9418 18.1619 11.8287 17.889C11.7157 17.616 11.5499 17.3679 11.341 17.159C11.1321 16.9501 10.884 16.7843 10.611 16.6713C10.3381 16.5582 10.0455 16.5 9.75 16.5C9.15326 16.5 8.58097 16.7371 8.15901 17.159C7.73705 17.581 7.5 18.1533 7.5 18.75C7.5 19.3467 7.73705 19.919 8.15901 20.341C8.58097 20.7629 9.15326 21 9.75 21ZM15.75 21C16.0455 21 16.3381 20.9418 16.611 20.8287C16.884 20.7157 17.1321 20.5499 17.341 20.341C17.5499 20.1321 17.7157 19.884 17.8287 19.611C17.9418 19.3381 18 19.0455 18 18.75C18 18.4545 17.9418 18.1619 17.8287 17.889C17.7157 17.616 17.5499 17.3679 17.341 17.159C17.1321 16.9501 16.884 16.7843 16.611 16.6713C16.3381 16.5582 16.0455 16.5 15.75 16.5C15.1533 16.5 14.581 16.7371 14.159 17.159C13.7371 17.581 13.5 18.1533 13.5 18.75C13.5 19.3467 13.7371 19.919 14.159 20.341C14.581 20.7629 15.1533 21 15.75 21Z" />
        </svg>
      </button>
      {/* Profile */}
      <button
        className="w-full flex justify-center cursor-pointer"
        aria-label="Profile"
        aria-current={pathname === '/profile' ? 'page' : undefined}
        onClick={() => router.push('/profile')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill={iconColor('/profile')} xmlns="http://www.w3.org/2000/svg">
          <path d="M19.652 19.405C20.204 19.29 20.534 18.712 20.259 18.218C19.653 17.131 18.699 16.175 17.479 15.447C15.907 14.509 13.98 14 12 14C10.02 14 8.093 14.508 6.521 15.447C5.301 16.175 4.347 17.131 3.741 18.218C3.466 18.712 3.796 19.29 4.348 19.405C9.39477 20.4569 14.6042 20.4569 19.651 19.405" />
          <path d="M12 13C14.7614 13 17 10.7614 17 8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8C7 10.7614 9.23858 13 12 13Z" />
        </svg>
      </button>
    </nav>
  )
}
