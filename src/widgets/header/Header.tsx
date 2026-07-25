import Avatar from '@/shared/ui/Avatar/Avatar'
import IconButton from '@/shared/ui/IconButton'
import CartIcon from '@/entities/cart/ui/CartIcon';
import NotificationBell from '@/entities/notification/ui/NotificationBell';
import { CartMenu } from '@/features/cart-menu';
import { usePathname } from 'next/navigation';
import { HeaderConfig, headerConfig, HeaderRoute } from './config';
import { useRouter } from 'next/router'
import { useTelegram } from '@/shared/hooks/useTelegram/useTelegram';

export default function Header() {
  const router = useRouter();
  const { user } = useTelegram();
  const pathname = (usePathname() ?? '/') as HeaderRoute;
  const currentConfig: HeaderConfig = headerConfig[pathname];

  const navigateBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <header className={`flex relative justify-between w-full container ${currentConfig?.onDarkBackground ? 'text-white' : ''}`}>
      {currentConfig?.user && (
        <div className='flex items-center gap-2.5' data-testid="user">
          <Avatar src={user?.photo_url} />
          <div className='flex flex-col justify-between'>
            <p className='h5-regular'>Welcome Back</p>
            <b className="h5-bold" data-testid='name-user'>{user?.name || 'Guest'}</b>
          </div>
        </div>
      )}

      {currentConfig?.backRoute && (
        <IconButton sx={{ width: 50, height: 50 }} data-testid="btn-navigate-back" onClick={navigateBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.4231 17.308L8.65385 11.5388L14.4231 5.76953" stroke="black" strokeWidth="1.42857" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconButton>
      )}

      {currentConfig?.centerName && (
        <div className='w-full flex justify-center items-center' data-testid="center-name">
          <h3 className='h3-bold'>{currentConfig.title}</h3>
        </div>
      )}

      <div className='flex items-center gap-1.5'>
        {currentConfig?.cartIcon && <CartIcon onClick={() => router.push('/cart')} />}

        {currentConfig?.notificationIcon && (
          <NotificationBell onClick={() => router.push('/notifications')} />
        )}

        {currentConfig?.dots && <CartMenu />}
      </div>


    </header >)
}