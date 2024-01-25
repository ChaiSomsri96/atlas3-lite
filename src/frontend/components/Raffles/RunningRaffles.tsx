import { useEffect, useState } from "react";
import { Loader } from "../Loader";
import {
  ExtendedRaffle,
  useRunningRaffles,
} from "@/frontend/hooks/useRunningRaffles";
import RaffleCard from "./RaffleCard";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function RunningRaffles() {
  const [raffles, setRaffles] = useState<ExtendedRaffle[]>();

  const { data: ret, isLoading, refetch } = useRunningRaffles();

  useEffect(() => {
    if (ret) {
      setRaffles(ret.raffles);
    }
  }, [ret]);

  return (
    <div>
      <div className="flex gap-2 items-center justify-end -mt-12">
        {
          <p className="mr-2 text-sm text-gray-400 hidden sm:block">
            <WalletMultiButton className="text-center bg-gradient-to-r from-primary-500 to-primary-500 via-primary-500 rounded-md shadow-sm py-2 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-50 focus:ring-indigo-500" />
          </p>
        }
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        raffles && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            {raffles?.map((raffle) => (
              <RaffleCard key={raffle.id} raffle={raffle} refetch={refetch} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
