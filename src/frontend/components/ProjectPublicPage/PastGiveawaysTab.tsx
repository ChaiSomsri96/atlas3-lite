import { usePublicProjectGiveaways } from "@/frontend/hooks/usePublicProjectGiveaways";
import { useSession } from "next-auth/react";
import { GiveawayCard } from "../GiveawayCard";
import { Loader } from "../Loader";

export const PastGiveawaysTab = ({ projectSlug }: { projectSlug: string }) => {
  const { data: session } = useSession();

  const { data: giveaways, isLoading } = usePublicProjectGiveaways({
    slug: projectSlug,
    giveawayStatus: "past",
  });

  return (
    <div>
      {isLoading && <Loader />}

      {giveaways && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {giveaways.map((giveaway) => (
            <GiveawayCard
              key={giveaway.id}
              giveaway={giveaway}
              variant={session ? "own" : "all"}
            />
          ))}
        </div>
      )}
    </div>
  );
};
