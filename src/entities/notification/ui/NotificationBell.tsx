import IconButton from '@/shared/ui/IconButton';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { styled } from '@mui/material/styles';
import Badge, { badgeClasses } from '@mui/material/Badge';
import { useAppSelector } from '@/app/providers/store-provider/config/hooks';
import { selectUnreadNotificationCount } from '../model/notification.slice';

/**
 * The largest number printed in the badge. Twenty notifications are kept, and a
 * two-digit number stretches the dot out of its circle; the button's accessible
 * name still carries the exact figure, so nothing is rounded away.
 */
const MAX_BADGE_COUNT = 9;

const BellBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -15px;
    right: -7px;
  }
`;

interface NotificationBellProps {
  onClick?: () => void;
}

/**
 * The header bell, counting what is genuinely unread.
 *
 * This badge replaces one that was hardcoded to "2" whether or not anything had
 * happened, so the count comes straight from the notification slice and the only
 * thing that can raise it is placing an order.
 */
export default function NotificationBell({ onClick }: NotificationBellProps) {
  const unreadCount = useAppSelector(selectUnreadNotificationCount);

  return (
    <IconButton
      sx={{ width: 50, height: 50 }}
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
      data-testid="notification-icon"
      onClick={onClick}
    >
      <NotificationsNoneIcon sx={{ color: 'black' }} />

      {/*
        Left out of the tree entirely at zero rather than hidden. MUI keeps a zero
        badge mounted and greys it out with a class, which would leave a stale number
        sitting in the DOM for anything reading the page — the exact shape of the bug
        this control is being rebuilt to fix.
      */}
      {unreadCount > 0 && (
        <BellBadge
          data-testid="notification-badge"
          badgeContent={unreadCount}
          max={MAX_BADGE_COUNT}
          color="warning"
          overlap="circular"
        />
      )}
    </IconButton>
  );
}
