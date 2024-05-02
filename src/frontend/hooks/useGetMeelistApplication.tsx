import { MeeListResponseData } from "@/pages/api/me/meelist";
import { useQuery } from "react-query";

export const PRESALE_KEY = "meelist";

export const getMeelist = async () => {
  // Need URL in SSR
  const url = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/me/meelist`
    : `/api/me/meelist`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const allocation: MeeListResponseData = data;

  return allocation;
};

export const useGetMeeListApplication = () => {
  return useQuery<MeeListResponseData>([PRESALE_KEY, "meelist"], () =>
    getMeelist()
  );
};
