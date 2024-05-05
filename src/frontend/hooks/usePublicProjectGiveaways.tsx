import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { ExtendedGiveaway } from "./useGiveaway";
import { PROJECT_KEY } from "./useProject";

export const usePublicProjectGiveaways = ({
  slug,
  giveawayStatus,
}: {
  slug: string;
  giveawayStatus: "running" | "joined" | "past";
}) => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<ExtendedGiveaway[]>(
    [PROJECT_KEY, "publicProjectGiveaways", slug, giveawayStatus],
    async () => {
      const response = await fetch(
        `/api/project/${slug}/giveaway?status=${giveawayStatus}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch project giveaways");
      }

      const data = await response.json();

      return data.giveaways;
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
