import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";

export const GiveawayAbout = ({ giveaway }: { giveaway: ExtendedGiveaway }) => {
  return (
    <div className="mt-6">
      <h3 className="text-gray-400 text-xs">ABOUT</h3>
      <p className="mt-1 whitespace-pre-line break-words">
        {giveaway.description}
      </p>
    </div>
  );
};
