import { ReactNode } from "react";
import Button from "../Button";

interface ActionOfferCardProps {
  text: string;
  type: 'set-payment';
  actionLabel?: string;
  onClick?: () => void;
}

const ACTION_CONFIG: Record<
  ActionOfferCardProps['type'],
  { buttonLabel: string; icon: ReactNode }
> = {
  'set-payment': {
    buttonLabel: 'Set',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.5386 14.2998C11.8264 14.2998 12.1027 14.4137 12.3062 14.6172C12.5096 14.8207 12.6235 15.097 12.6235 15.3848C12.6235 15.6725 12.5096 15.9489 12.3062 16.1523C12.1027 16.3558 11.8264 16.4697 11.5386 16.4697C11.2508 16.4697 10.9745 16.3558 10.771 16.1523C10.5675 15.9489 10.4536 15.6725 10.4536 15.3848C10.4536 15.097 10.5675 14.8207 10.771 14.6172C10.9745 14.4137 11.2508 14.2998 11.5386 14.2998Z" fill="black" stroke="black" strokeWidth="0.714286" />
        <path d="M13.7951 0.634766L16.8528 4.91938L18.8692 4.23188L20.7096 9.61554H21.6346V21.154H1.44226V9.61554H1.93265V9.60592L2.55572 9.61169L13.7951 0.634766ZM9.03553 9.61554H18.6778L17.6807 6.69919L16.2173 7.16746L9.03553 9.61554ZM7.53745 8.09342L14.9519 5.56746L13.4096 3.404L7.53745 8.09342ZM5.28842 11.5386H3.36534V13.4617C3.87537 13.4617 4.36451 13.2591 4.72516 12.8984C5.08581 12.5378 5.28842 12.0486 5.28842 11.5386ZM14.9038 15.3848C14.9038 14.9428 14.8168 14.5052 14.6476 14.0969C14.4785 13.6886 14.2306 13.3176 13.9181 13.0051C13.6056 12.6926 13.2346 12.4447 12.8263 12.2756C12.418 12.1064 11.9804 12.0194 11.5384 12.0194C11.0965 12.0194 10.6588 12.1064 10.2505 12.2756C9.84223 12.4447 9.47123 12.6926 9.15873 13.0051C8.84622 13.3176 8.59833 13.6886 8.42921 14.0969C8.26008 14.5052 8.17303 14.9428 8.17303 15.3848C8.17303 16.2773 8.5276 17.1333 9.15873 17.7645C9.78986 18.3956 10.6459 18.7502 11.5384 18.7502C12.431 18.7502 13.287 18.3956 13.9181 17.7645C14.5492 17.1333 14.9038 16.2773 14.9038 15.3848ZM19.7115 19.2309V17.3078C19.2015 17.3078 18.7123 17.5105 18.3517 17.8711C17.991 18.2317 17.7884 18.7209 17.7884 19.2309H19.7115ZM17.7884 11.5386C17.7884 12.0486 17.991 12.5378 18.3517 12.8984C18.7123 13.2591 19.2015 13.4617 19.7115 13.4617V11.5386H17.7884ZM3.36534 19.2309H5.28842C5.28842 18.7209 5.08581 18.2317 4.72516 17.8711C4.36451 17.5105 3.87537 17.3078 3.36534 17.3078V19.2309Z" fill="black" />
      </svg>

    ),
  },
};

export default function ActionOfferCard({ text, type, actionLabel, onClick }: ActionOfferCardProps) {
  const { icon, buttonLabel } = ACTION_CONFIG[type];

  return (
    <div className="shadow bg-white p-4 rounded-[30px] flex items-center">

      <div className="bg-flash-white rounded-full flex justify-center items-center p-[13px]">
        {icon}
      </div>

      <span className="small-regular ml-2.5">{text}</span>

      <Button
        colorType="success"
        sx={{
          marginLeft: 'auto',
          textTransform: 'none',
          borderRadius: '10px',
        }}
        onClick={onClick}
      >
        {actionLabel ?? buttonLabel}
      </Button>
    </div>

  )
}
