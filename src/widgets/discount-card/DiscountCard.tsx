import Image from 'next/image'

interface DiscountCardProps {
  className?: string;
}

export default function DiscountCard({ className }: DiscountCardProps) {
  return (
    <div className={className}>
      <div className="relative bg-green-500 w-full rounded-[30px] p-4 pb-[71px] flex flex-col text-white overflow-hidden">
        <h3 className="h3-bold">Fresh Deals <br />
          Today 20% OFF
        </h3>
        <span className="small-regular mt-2.5">Special prices on selected groceries</span>

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
