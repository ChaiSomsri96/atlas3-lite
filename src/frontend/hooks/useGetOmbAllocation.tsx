import { useQuery } from "react-query";

export const PRESALE_KEY = "ombAlloc";

type Allocation = {
  allocation: number;
  wallets: string[];
};

export const getAlloc = async () => {
  // Need URL in SSR
  const url = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/me/omb`
    : `/api/me/omb`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  const allocation: Allocation = data;

  return allocation;
};

export const useGetOmbAllocation = () => {
  return useQuery<Allocation>([PRESALE_KEY, "alloc"], () => getAlloc());
};
