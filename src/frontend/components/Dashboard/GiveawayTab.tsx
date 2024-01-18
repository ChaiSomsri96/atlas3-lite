import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { useJoinedGiveaways } from "@/frontend/hooks/useJoinedGiveaways";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { GiveawayCard } from "../GiveawayCard";
import { Loader } from "../Loader";

export default function GiveawayTab({
  giveawayStatus,
  sortOption,
  handleTotal,
}: {
  giveawayStatus: string;
  sortOption: string;
  handleTotal: (e: number) => void;
}) {
  const pageLength = 12;
  const [page, setPage] = useState<number>(1);
  const [giveaways, setGiveaways] = useState<ExtendedGiveaway[]>();
  const [total, setTotal] = useState<number>();

  useEffect(() => {
    setPage(1);
  }, [sortOption]);

  const { data: ret, isLoading } = useJoinedGiveaways({
    page,
    pageLength,
    sortOption,
    giveawayStatus,
  });

  useEffect(() => {
    if (ret) {
      if (giveaways && page > 1) {
        setGiveaways([...giveaways, ...ret.giveaways]);
      } else {
        setGiveaways(ret.giveaways);
      }

      setTotal(ret.total);
      handleTotal(ret.total);
    }
  }, [ret]);

  const handleNext = () => {
    setPage(page + 1);
  };

  return (
    <div>
      {(!giveaways || giveaways.length == 0) && isLoading && <Loader />}

      {giveaways && (
        <InfiniteScroll
          dataLength={giveaways.length}
          next={handleNext}
          hasMore={giveaways.length < (total ?? 0)}
          loader={<Loader />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {giveaways.map((giveaway) => (
              <GiveawayCard
                key={giveaway.id}
                giveaway={giveaway}
                variant="own"
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}
