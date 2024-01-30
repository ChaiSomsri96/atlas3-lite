import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { usePublicProjectGiveaways } from "@/frontend/hooks/usePublicProjectGiveaways";
import { GiveawayCard } from "../GiveawayCard";
import { Loader } from "../Loader";

export const RunningGiveawaysTab = ({
  projectSlug,
}: {
  projectSlug: string;
}) => {
  const { data: giveaways, isLoading } = usePublicProjectGiveaways({
    slug: projectSlug,
    giveawayStatus: "running",
  });

  return (
    <div>
      {isLoading && <Loader />}

      {giveaways && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {giveaways?.map((giveaway) => (
            <GiveawayCard
              key={giveaway.id}
              giveaway={giveaway as ExtendedGiveaway}
              variant="all"
            />
          ))}
        </div>
      )}
    </div>
  );
};
