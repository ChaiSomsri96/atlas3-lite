import { PresaleEntriesResponseData } from "@/pages/api/me/joined-presales";
import { useQuery } from "react-query";


export const usePresales = () => {
  return useQuery<PresaleEntriesResponseData>(
    [
      "PRESALE_KEY}",
      "allPresales",
    ],
    async () => {
      const response = await fetch(
        `/api/me/joined-presales`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch all presales");
      }

      const data = await response.json();

      return {
        entries: data.entries,
      };
    }
  );
};
