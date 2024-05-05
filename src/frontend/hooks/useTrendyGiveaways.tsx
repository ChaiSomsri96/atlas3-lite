import { useQuery } from "react-query";
import { ExtendedGiveaway } from "./useGiveaway";
import { PROJECT_KEY } from "./useProject";

export const useTrendyGiveaways = () => {
  return useQuery<ExtendedGiveaway[] | undefined>(
    [PROJECT_KEY, "trendyGiveaways"],
    async () => {
      const response = await fetch(`/api/creator/trendy-giveaways`);

      if (!response.ok) {
        throw new Error("Failed to fetch trendy giveaways");
      }

      const data = await response.json();
      const trendyGiveaways: ExtendedGiveaway[] = data.giveaways;

      return trendyGiveaways;
    },
    { enabled: true }
  );
};
