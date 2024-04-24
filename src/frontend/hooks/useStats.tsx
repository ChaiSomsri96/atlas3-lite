import { useQuery } from "react-query";
import { Stats } from "@prisma/client";

type StatsResponseData = {
  stats: Stats;
};

export const useStats = () => {
  return useQuery<StatsResponseData | undefined>(["stats"], async () => {
    const requestUrl = `/api/me/stats`;

    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch stats. Please raise a ticket in BSL.");
    }

    const data = await response.json();
    const stats = data as StatsResponseData;

    return stats;
  });
};
