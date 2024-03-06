import { useSession } from "next-auth/react";
import { useQuery } from "react-query";
import { ExtendedPresale } from "./usePresale";
import { PROJECT_KEY } from "./useProject";

export type JoinedPresalesResp = {
  presales: ExtendedPresale[];
  total: number;
};

export const useJoinedPresales = ({
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

  return useQuery<JoinedPresalesResp>(
    [
      PROJECT_KEY,
      "joinedPresales",
      session?.user?.id,
      page,
      pageLength,
      sortOption,
      giveawayStatus,
    ],
    async () => {
      const response = await fetch(
        `/api/me/joined-presales?sortOption=${sortOption}&page=${page}&pageLength=${pageLength}&status=${giveawayStatus}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch owned presales");
      }

      const data = await response.json();

      return {
        presales: data.presales,
        total: data.total,
      };
    },
    { enabled: !sessionLoading && !!session?.user?.id }
  );
};
