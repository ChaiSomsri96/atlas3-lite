import { FC } from "react";
import Image from "next/image";
import { Reward } from "@prisma/client";
import Link from "next/link";

interface ItemProps {
  num: number;
  item: Reward;
}

const LotteryPrizeLineItem: FC<ItemProps> = ({ num, item }) => {
  return (
    <div className="border-b border-primary-800 pb-5 last:border-none">
      <div className="flex items-center gap-6">
        <div className="border rounded-lg border-primary-800 bg-primary-900 py-2 px-3 relative leading-3 overflow-hidden">
          {num}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-5 h-[3px] -bottom-[1px] rounded-t-lg bg-[#0085EA]"
            style={{
              boxShadow:
                "0px -4px 35px 11px rgba(30, 144, 255, 0.30), 0px -2px 10px 4px rgba(30, 144, 255, 0.60)",
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden">
            <Image src={item.imageUrl} fill alt="" />
          </div>
          <div className="">
            <p className="opacity-50 text-[12px] font-medium leading-4">
              Sponsored by {item.sponsored}
            </p>
            <Link
              className="mt-1 text-[18px] leading-[1] font-semibold"
              href={item.imageUrl}
              target="_blank"
            >
              {item.quantity}x {item.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryPrizeLineItem;
