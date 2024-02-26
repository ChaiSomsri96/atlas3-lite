import { Project } from "@prisma/client";
import { useQuery } from "react-query";

export const COLLECTION_KEY = "collection";

export const useAllCollections = ({
  search,
  limit,
  collectionsShow,
}: {
  search: string;
  limit?: number;
  collectionsShow: boolean;
}) => {
  return useQuery<Project[]>(
    [COLLECTION_KEY, "allCollections", search, collectionsShow],
    async () => {
      if (!collectionsShow) {
        return [];
      }

      const response = await fetch(
        `/api/creator/all-collections?search=${search}&limit=${limit ?? 10}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch all collections");
      }

      const data = await response.json();
      return data.collections;
    }
  );
};
