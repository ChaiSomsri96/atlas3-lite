import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { ExtendedGiveaway } from "./useGiveaway";
import { PROJECT_KEY } from "./useProject";

export type JoinedGiveawaysResp = {
  giveaways: ExtendedGiveaway[];
  total: number;
};

export const useJoinedGiveaways = ({
  page,
  pageLength,
  sortOption,
  giveawayStatus,
}: {
  page: number;
  pageLength: number;
  sortOption: string;
  giveawayStatus: string;
}) => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  return useQuery<JoinedGiveawaysResp>(
    [
      PROJECT_KEY,
      "joinedGiveaways",
      session?.user?.id,
      page,
      pageLength,
      sortOption,
      giveawayStatus,
    ],
    async () => {
      let response;

      switch (giveawayStatus) {
        case "running":
          response = await fetch(
            `/api/me/running-giveaways?page=${page}&pageLength=${pageLength}`
          );
          break;
        case "won":
          response = await fetch(
            `/api/me/won-giveaways?&page=${page}&pageLength=${pageLength}`
          );
          break;
        case "lost":
          response = await fetch(
            `/api/me/lost-giveaways?&page=${page}&pageLength=${pageLength}`
          );
          break;
        case "entered":
          response = await fetch(
            `/api/me/joined-giveaways?&page=${page}&pageLength=${pageLength}`
          );
          break;
      }

      if (response) {
        if (!response.ok) {
          throw new Error("Failed to fetch owned giveaways");
        }

        const data = await response.json();

        return {
          giveaways: data.giveaways,
          total: data.total,
        };
      }

      throw new Error("Failed to fetch giveaways");
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
