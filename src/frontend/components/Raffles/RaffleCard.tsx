import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { getTimeRemaining } from "@/frontend/utils/getTimeRemanining";
import Card from "../Card";
import ToolTip from "../ToolTip";
import { ExtendedRaffle } from "@/frontend/hooks/useRunningRaffles";
import { enterGiveawayWithMemo } from "@/frontend/utils/enterGiveawayWithMemo";
import { VAULT_PUBLIC_KEY } from "@/shared/constants";
import { useHandleFetchTransaction } from "@/frontend/handlers/useHandleFetchTransaction";
import { TransactionStatus } from "@prisma/client";
import { useHandleValidateEnterRaffle } from "@/frontend/handlers/useHandleValidateEnterRaffle";
import SocialButtons from "../SocialButtons";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Props = {
  raffle: ExtendedRaffle;
  refetch: () => void;
};

export default function RaffleCard({ raffle, refetch }: Props) {
  const [ticketAmount, setTicketAmount] = useState(1);

  const [timeRemanining, setTimeRemaining] = useState(
    getTimeRemaining(raffle.endsAt ? raffle.endsAt : new Date())
  );
  const { connection } = useConnection();
  const { data: session } = useSession();
  const solanaWallet = useWallet();
  const handleFetchTransaction = useHandleFetchTransaction();
  const handleValidateEnterRaffle = useHandleValidateEnterRaffle();

  const handleSetTicketAmount = (amount: string) => {
    const amountNumber = parseInt(amount);
    if (amountNumber <= 999) {
      setTicketAmount(amountNumber);
    }
  };

  const depositToken = async () => {
    if (!raffle.paymentTokenAmount || !raffle.paymentToken) {
      toast.error("Payment token info invalid");
      return;
    }

    if (!ticketAmount) {
      toast.error("You need to input token amount");
      return;
    }

    if (ticketAmount < 1) {
      toast.error("Ticket amount should be more than 1");
      return;
    }

    if (solanaWallet && !solanaWallet.publicKey) {
      toast.error("You need to connect wallet");
      return;
    }

    const toastId = toast.loading("Processing transaction...");
    const amount = ticketAmount * raffle.paymentTokenAmount;
    try {
      const txSignature = await enterGiveawayWithMemo({
        connection,
        wallet: solanaWallet,
        walletAddress:
          session?.user.wallets.find(
            (x) => x.network === raffle.network && x.isDefault
          )?.address ?? "",
        to: VAULT_PUBLIC_KEY,
        mint: raffle.paymentToken.tokenAddress,
        amount,
        ticketAmount,
        giveawayId: raffle.id,
        tokenId: raffle.paymentToken.id,
        session,
      });

      let transaction = null;
      for (let i = 0; i < 30; i++) {
        try {
          transaction = await handleFetchTransaction.mutateAsync({
            txSignature,
          });
          console.log(transaction);

          if (transaction && transaction.status != TransactionStatus.PENDING) {
            break;
          }
        } catch {}
        await sleep(5 * 1000); // 5 sec
      }

      if (transaction && transaction.status == TransactionStatus.SUCCESSED) {
        toast.success("Transaction successful!", {
          id: toastId,
        });
        refetch();
      } else {
        toast.error("Transaction failed.", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error((error as Error).message, {
        id: toastId,
      });
    }
  };

  const handleEnterGiveaway = () => {
    if (!raffle.paymentTokenAmount || !raffle.paymentToken) {
      toast.error("Payment token info invalid");
      return;
    }

    if (!ticketAmount) {
      toast.error("Please set a ticket amount");
      return;
    }

    if (!solanaWallet.publicKey) {
      toast.error("You need to connect wallet");
      return;
    }

    const toastId = toast.loading("Verifying requirements...");
    console.log(raffle);

    handleValidateEnterRaffle.mutate(
      {
        giveawaySlug: raffle.slug,
      },
      {
        onSuccess(isSuccessed) {
          if (isSuccessed.isSuccess) {
            toast.remove(toastId);
            depositToken();
          } else {
            toast.error("Failed to meet requirements.", {
              id: toastId,
            });
          }
        },
        onError(error) {
          toast.error((error as Error).message, {
            id: toastId,
          });
        },
      }
    );
  };

  const raffleSummary =
    raffle.description?.length > 100
      ? `${raffle.description.substring(0, 120)}...`
      : raffle.description;

  // counter interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(
        getTimeRemaining(raffle.endsAt ? raffle.endsAt : new Date())
      );
    }, 1000);

    return () => clearInterval(interval);
  });

  const formatPrice = (price: number): number => {
    return Number(price.toFixed(2));
  };

  return (
    <Card>
      <div>
        {/*  <RaffleDetailsSlideOver
          detailsModalOpen={detailsModalOpen}
          setDetailsModalOpen={setDetailsModalOpen}
          raffle={raffle}
  />*/}
        <img
          className="h-48 w-full bg-cover rounded-lg object-cover"
          src={raffle.bannerUrl ?? ""}
        />

        <div className="my-5 text-center mx-2 ">
          <h3 className=" text-lg mb-2">{raffle.name}</h3>

          <p className="text-sm text-neutral-400 raffle-description h-16">
            {raffleSummary}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-neutral-500 font-bold mt-3" />

        <div className="flex flex-row justify-between px-2 mt-6 items-center">
          <div className="flex flex-row justify-center items-center">
            {raffle.processed ? (
              <>
                <div className="rounded-full bg-red-500 w-3 h-3"></div>
                <div className="px-2 text-xs">Closed</div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-green-500 w-3 h-3"></div>
                <div className="px-2 text-xs">Live</div>
              </>
            )}
          </div>
          {new Date(raffle.endsAt ? raffle.endsAt : new Date()) < new Date() ? (
            <div className="text-xs">
              Ended at{" "}
              {new Date(raffle.endsAt ? raffle.endsAt : new Date())
                .toISOString()
                .slice(0, 10)}
            </div>
          ) : (
            <div className="text-xs">Ends in {timeRemanining}</div>
          )}
        </div>

        {/* Ticket price */}
        <div className="flex flex-row justify-between px-2 my-3 items-center text-sm">
          <p className="text-neutral-400">Ticket Price</p>
          <p>
            {" "}
            {formatPrice(raffle.paymentTokenAmount ?? 0)} $
            {raffle.paymentToken?.tokenName}{" "}
          </p>
        </div>

        {raffle.discordRoleId && (
          <>
            {/* Role Name */}
            <div className="flex flex-row justify-between px-2 my-3 items-center text-sm">
              <p className="text-neutral-400">Role Name</p>
              <p>
                {" "}
                <span className={`inline-block`}>
                  {
                    raffle.collabProject?.allowlist?.roles?.find(
                      (x) => x.id === raffle.discordRoleId
                    )?.name
                  }
                </span>{" "}
                <span className="inline-block">
                  <ToolTip message="This is the role you will receive. Do your own research on what this role means." />
                </span>
              </p>
            </div>
          </>
        )}

        {raffle.network && (
          <>
            {/* Role Name */}
            <div className="flex flex-row justify-between px-2 my-3 items-center text-sm">
              <p className="text-neutral-400">Network</p>
              <p>
                {" "}
                <span className={`inline-block`}>{raffle.network}</span>{" "}
              </p>
            </div>
          </>
        )}

        {/* Winners */}
        <div className="flex flex-row justify-between px-2 my-3 items-center text-sm">
          <p className="text-neutral-400">Winners</p>
          <p>{raffle.maxWinners}</p>
        </div>

        {/* Spent */}
        <div className="flex flex-row justify-between px-2 my-3 items-center text-sm">
          <p className="text-neutral-400">
            ${raffle.paymentToken?.tokenName} Spent
          </p>
          <p>{(raffle.paymentTokenAmount ?? 0) * raffle.entryCount}</p>
        </div>

        {/* Spent */}
        <div className="flex flex-row justify-between px-2 my-3 items-center text-sm">
          <p className="text-neutral-400">Unique Users Entered </p>
          <p>{raffle.usersEntered ?? 0}</p>
        </div>

        {/* Tickets sold */}
        <div className="flex flex-row justify-between px-2 my-3 items-center text-sm">
          <p className="text-neutral-400">Tickets Sold</p>
          <p>{raffle.entryCount}</p>
        </div>

        {/* Entries */}
        <div className="flex flex-row justify-between px-2 my-3 items-center text-sm">
          <p className="text-neutral-400">Your Tickets</p>
          <p>
            {raffle.entries && raffle.entries.length > 0
              ? raffle.entries[0].entryAmount
              : 0}
          </p>
        </div>

        <>
          <>
            {new Date(raffle.endsAt ?? new Date()) < new Date() &&
              !raffle.processed && ( // date passed but not ended
                <div className="flex gap-3 mt-3">
                  <label htmlFor="quantity" className="sr-only">
                    Quantity
                  </label>

                  <button
                    disabled={!ticketAmount}
                    className="w-full opacity-40 bg-primary-700 rounded-md shadow-sm py-3 px-4 text-base font-medium text-white focus:outline-none focus:ring-2"
                  >
                    Picking Winners
                  </button>
                </div>
              )}
          </>
          <>
            {new Date(raffle.endsAt ?? new Date()) < new Date() &&
              raffle.processed && ( // ended
                <div className="flex gap-3 mt-3">
                  <button
                    disabled={!ticketAmount}
                    className={`w-full ${
                      raffle.entries &&
                      raffle.entries.length > 0 &&
                      raffle.entries[0].isWinner
                        ? `bg-gradient-to-r "from-green-600 to-green-500 via-green-500"`
                        : "bg-neutral-600"
                    } rounded-md shadow-sm py-3 px-4 text-base font-medium text-white  focus:outline-none focus:ring-2`}
                  >
                    {raffle.entries &&
                    raffle.entries.length > 0 &&
                    raffle.entries[0].isWinner
                      ? "You Won!"
                      : "You Lost"}
                  </button>
                </div>
              )}
          </>
          <>
            {new Date(raffle.endsAt ?? new Date()) > new Date() && (
              <>
                <div className="flex gap-3 mt-3">
                  <label htmlFor="quantity" className="sr-only">
                    Quantity
                  </label>
                  <input
                    onChange={(e) => handleSetTicketAmount(e.target.value)}
                    value={ticketAmount}
                    className="rounded-md border border-neutral-300 bg-neutral-700 text-center text-base font-medium w-16 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-400 focus:border-primary-400 sm:text-sm"
                  ></input>
                  <button
                    disabled={!ticketAmount}
                    className="opacity-100 w-full bg-primary-500 rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2"
                    onClick={() => handleEnterGiveaway()}
                  >
                    Buy {ticketAmount} Ticket{ticketAmount > 1 && "s"}
                  </button>
                </div>
                <button
                  onClick={() => {
                    window.open(
                      `https://jup.ag/swap/SOL-${raffle.paymentToken?.tokenName}`,
                      "_blank"
                    );
                  }}
                  className="text-center mt-2 w-full bg-gradient-to-r from-primary-500 to-primary-500 via-primary-500 rounded-md shadow-sm py-2 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-50 focus:ring-indigo-500"
                >
                  Buy ${raffle.paymentToken?.tokenName}
                </button>
              </>
            )}
          </>
        </>

        {/* Divider */}
        <div className="w-full border-t border-neutral-500 font-bold mt-6" />

        {/* Socials */}
        <SocialButtons
          twitter={`https://twitter.com/${raffle.twitterUsername}`}
          discord={raffle.discordInviteUrl ?? ""}
        />
      </div>
    </Card>
  );
}
