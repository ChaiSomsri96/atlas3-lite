import { useEffect, useState } from "react";
import { Loader } from "../Loader";
import { ExtendedRaffle } from "@/frontend/hooks/useRunningRaffles";
import RaffleCard from "./RaffleCard";
import { useClosedRaffles } from "@/frontend/hooks/useClosedRaffles";

export default function ClosedRaffles() {
  const [raffles, setRaffles] = useState<ExtendedRaffle[]>();

  const { data: ret, isLoading, refetch } = useClosedRaffles();

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
