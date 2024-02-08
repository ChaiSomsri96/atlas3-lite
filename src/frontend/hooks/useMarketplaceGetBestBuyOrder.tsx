import { useQuery } from "react-query";

export type MarketplaceBestBuyOrderData = {
  points: number;
  floorPrice: number;
};

export const useMarketplaceGetBestBuyOrder = ({
  projectId,
}: {
  projectId: string;
}) => {
  return useQuery<MarketplaceBestBuyOrderData>(
    ["bestBuyOrder", projectId],
    async () => {
      if (!projectId) {
        return {
          points: 0,
          floorPrice: 0,
        };
      }

      const response = await fetch(
        `/api/me/marketplace/${projectId}/best-buy-order`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();

      return {
        points: data.points,
        floorPrice: data.floorPrice,
      };
    }
  );
};
