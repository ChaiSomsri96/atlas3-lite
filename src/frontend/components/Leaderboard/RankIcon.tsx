import { ArrowDown2, ArrowUp2 } from "iconsax-react";
import { MdDehaze } from "react-icons/md";

export enum RankType {
  Same,
  Up,
  Down,
}

export const RankIcon = ({ type }: { type: RankType }) => {
  return (
    <div className="flex flex-col z-10">
      {type == RankType.Up && <ArrowUp2 className="w-5 h-5 text-success-500" />}
      {type == RankType.Down && (
        <ArrowDown2 className="w-5 h-5 text-error-500" />
      )}
      {type == RankType.Same && <MdDehaze className="w-4 h-4" />}
    </div>
  );
};
