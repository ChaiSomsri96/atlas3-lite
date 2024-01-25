import { useEffect, useState } from "react";
import { Loader } from "../Loader";
import { ExtendedRaffle } from "@/frontend/hooks/useRunningRaffles";
import RaffleCard from "./RaffleCard";
import { useWonRaffles } from "@/frontend/hooks/useWonRaffles";

export default function WonRaffles() {
  const [raffles, setRaffles] = useState<ExtendedRaffle[]>();

  const { data: ret, isLoading, refetch } = useWonRaffles();

  useEffect(() => {
    if (ret) {
      setRaffles(ret.raffles);
    }
  }, [ret]);

  return (
    <div>
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
