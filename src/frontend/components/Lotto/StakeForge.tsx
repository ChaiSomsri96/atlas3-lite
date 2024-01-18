import { FC, useEffect, useState } from "react";
import { WalletSmIcon } from "./SvgIcons";
import Image from "next/image";
import { useForgeStaked } from "@/frontend/hooks/useForgeStaked";
import { toast } from "react-hot-toast";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { stakeForgeWithMemo } from "@/frontend/utils/stakeForgeWithMemo";
import { VAULT_PUBLIC_KEY_FORGE_STAKED, FORGE_MINT } from "@/shared/constants";
import { useSession } from "next-auth/react";
import { useHandleFetchForgeTransaction } from "@/frontend/handlers/useHandleFetchForgeTransaction";
import { TransactionStatus } from "@prisma/client";
import { sleep } from "@/frontend/utils";
import { useHandleFetchForgeWithdrawal } from "@/frontend/handlers/useHandleFetchForgeWithdrawal";
import { PendingWithdrawStatusResponseData } from "@/pages/api/me/forge/withdraw-status";
import { useHandleWithdrawUserForge } from "@/frontend/handlers/useHandleWithdrawUserForge";

type Props = {
  winners: number;
  totalForgeStaked: number;
  forgeBalance: number;
  refetchForgeBalance: (value: boolean) => void;
};

const StakeForge: FC<Props> = ({
  winners,
  totalForgeStaked,
  forgeBalance,
  refetchForgeBalance,
}: Props) => {
  const [amount, setAmount] = useState("0");
  const [tab, setTab] = useState<"stake" | "withdraw">("stake");

  const [myForgeStaked, setForgeStaked] = useState<number>();

  const { data: forgeStaked, refetch } = useForgeStaked();
  const winningChance = ((myForgeStaked ?? 0) / totalForgeStaked) * 100;

  const balance =
    tab === "withdraw" ? (myForgeStaked ?? 0) / 1000 : forgeBalance.toFixed(0);

  const handleMaxAmount = () => {
    if (balance) {
      setAmount(Math.floor(Number(balance)).toString());
    }
  };

  const handleHalfAmount = () => {
    if (balance) {
      setAmount(Math.floor(Number(balance) / 2).toString());
    }
  };

  useEffect(() => {
    if (forgeStaked) {
      setForgeStaked(forgeStaked.forgeStaked);
    }
  }, [forgeStaked]);

  const { connection } = useConnection();
  const solanaWallet = useWallet();
  const { data: session } = useSession();
  const handleFetchTransaction = useHandleFetchForgeTransaction();

  const purchaseForge = async (forge: number) => {
    const toastId = toast.loading("Staking $FORGE...");

    if (!solanaWallet.publicKey) {
      toast.error("Please connect your wallet.", {
        id: toastId,
      });
      return;
    }

    if (forge <= 0) {
      toast.error("Please enter a valid amount.", {
        id: toastId,
      });
      return;
    }

    if (forge.toString().includes(".")) {
      toast.error("Please enter a whole number.", {
        id: toastId,
      });
      return;
    }

    try {
      const txSignature = await stakeForgeWithMemo({
        connection,
        wallet: solanaWallet,
        to: VAULT_PUBLIC_KEY_FORGE_STAKED,
        mint: FORGE_MINT,
        forge,
        session,
      });

      let transaction = null;
      for (let i = 0; i < 30; i++) {
        try {
          transaction = await handleFetchTransaction.mutateAsync({
            txSignature,
          });

          if (transaction && transaction.status != TransactionStatus.PENDING) {
            break;
          }
        } catch {}
        await sleep(5 * 1000); // 5 sec
      }

      if (transaction && transaction.status == TransactionStatus.SUCCESSED) {
        toast.success("$FORGE staked!", {
          id: toastId,
          duration: 7000,
        });
        refetch();
        refetchForgeBalance(true);
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

  const handleFetchWithdrawal = useHandleFetchForgeWithdrawal();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const handleWithdrawUserForge = useHandleWithdrawUserForge();

  const withdrawForge = async (forge: number) => {
    if (!solanaWallet || !solanaWallet.publicKey) {
      return;
    }

    if (solanaWallet) {
      const toastId = toast.loading("Processing withdrawal...");
      setIsWithdrawing(true);
      handleWithdrawUserForge.mutate(
        {
          walletPublicKey: solanaWallet.publicKey.toBase58(),
          forge: forge,
        },
        {
          onSuccess: async () => {
            let withdrawal: PendingWithdrawStatusResponseData | undefined;

            for (let i = 0; i < 30; i++) {
              try {
                withdrawal = await handleFetchWithdrawal.mutateAsync();

                if (!withdrawal.processing) {
                  break;
                }
              } catch {}
              await sleep(5 * 1000); // 5 sec
            }

            if (withdrawal && !withdrawal.processing) {
              toast.success("Withdrawal successful!", {
                id: toastId,
                duration: 7000,
              });
              refetch();
              setAmount("0");
              setIsWithdrawing(false);
            } else {
              toast.success(
                "Withdrawal is taking some time, please raise a ticket in Blocksmith Labs if this doesn't arrive in 10 minutes.",
                { id: toastId }
              );
            }
          },
          onError: (error) => {
            toast.error((error as Error).message, { id: toastId });
            setIsWithdrawing(false);
          },
        }
      );
    }
  };

  return (
    <div className="border border-primary-800 rounded-2xl py-6 px-4">
      <div className="flex gap-0 flex-col md:flex-row">
        <div className="w-full md:w-[calc(100%-238px)] md:pr-6 md:border-r md:border-primary-800">
          <h2 className="text-[20px] font-semibold leading-7 -tracking-[0.4px]">
            Stake your $FORGE
          </h2>
          <p className="text-[14px] medium leading-[18px] mt-1 text-primary-50 opacity-50">
            Each staked $FORGE gives you a higher chance to win.
          </p>
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 rouned-xl bg-box p-1 rounded-xl">
                <button
                  className={`hover:bg-primary-600 duration-300 py-1 px-4 rounded-lg text-[12px] font-semibold leading-4 ${
                    tab === "stake" ? "bg-primary-500 " : ""
                  }`}
                  onClick={() => {
                    setAmount("0");
                    setTab("stake");
                  }}
                >
                  Stake
                </button>
                <button
                  className={`hover:bg-primary-600 duration-300 py-1 px-4 rounded-lg text-[12px] font-semibold leading-4 ${
                    tab === "withdraw" ? "bg-primary-500 " : ""
                  }`}
                  onClick={() => {
                    setAmount("0");
                    setTab("withdraw");
                  }}
                >
                  Withdraw
                </button>
              </div>

              <div className="flex">
                <div className="flex items-center gap-1 text-neutral-50 opacity-50">
                  <WalletSmIcon />
                  {balance}
                </div>
                <button
                  className="py-1 px-3 rounded-[4px] border border-primary-800 bg-primary-900 text-white ml-3 text-[10px] cursor-pointer"
                  onClick={() => {
                    handleHalfAmount();
                  }}
                >
                  Half
                </button>
                <button
                  className="py-1 px-3 rounded-[4px] border border-primary-800 bg-primary-900 text-white ml-1 text-[10px] cursor-pointer"
                  onClick={() => {
                    handleMaxAmount();
                  }}
                >
                  Max
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="border border-primary-800 rounded-xl my-2 py-1.5 pl-2 h-11 relative w-[calc(100%-132px)]"
                style={{
                  background:
                    "linear-gradient(103deg, #111B2E 18%, #16233A 49.8%)",
                }}
              >
                <input
                  value={amount}
                  className="h-full bg-transparent outline-none font-semibold text-[14px] -tracking-[0.28px] w-[calc(100%-120px)]"
                  placeholder="0"
                  onChange={(e) => {
                    // Allow only whole numbers
                    if (/^\d*$/.test(e.target.value)) {
                      setAmount(e.target.value);
                    }
                  }}
                />
                <button
                  className="absolute right-1 top-1 flex items-center rounded-md border border-[#dfa44B] bg-primary-900 font-semibold px-3 py-1"
                  style={{}}
                >
                  <Image
                    src="/images/forge.svg"
                    width={20.74}
                    height={24}
                    alt=""
                  />
                  $FORGE
                </button>
              </div>
              {tab === "stake" && (
                <button
                  className="bg-primary-500 hover:bg-primary-600 duration-300 py-3 px-[18px] rounded-xl shadow-btn text-[14px] font-semibold leading-4 h-10 w-[124px] cursor-pointer"
                  onClick={() => {
                    purchaseForge(Number(amount));
                  }}
                >
                  Stake
                </button>
              )}
              {tab === "withdraw" && (
                <button
                  className="bg-primary-500 hover:bg-primary-600 duration-300 py-3 px-[18px] rounded-xl shadow-btn text-[14px] font-semibold leading-4 h-10 w-[124px]"
                  disabled={isWithdrawing}
                  onClick={() => {
                    withdrawForge(Number(amount));
                  }}
                >
                  Withdraw
                </button>
              )}
            </div>
            {tab === "withdraw" && (
              <div className="flex items-center justify-between mt-3 pb-4">
                <p className="text-[12px] font-medium leading-[14px] text-primary-50 opacity-50">
                  Withdraw fee:
                </p>
                <p className="text-[12px] font-medium leading-[14px] text-primary-50 opacity-50">
                  2.00% - {(Number(amount) * 0.02).toFixed(2)} $FORGE
                </p>
              </div>
            )}
            {tab === "stake" && (
              <div className="flex items-center mt-3 pb-4">
                <p className="text-[12px] text-primary-50 font-medium leading-[14px] opacity-50">
                  Note that there is a 2% fee for withdrawal once staked.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="w-full md:w-[238px] md:ml-6 flex flex-row flex-wrap md:flex-col gap-2 mt-3 py-3 border-t md:border-none border-primary-800">
          <div className="border border-primary-800 rounded-xl bg-box p-3 w-full">
            <p className="text-white opacity-50 text-[12px]">
              Total winners for current round
            </p>
            <h5 className="font-semibold leading-[1] text-[18px] mt-1">
              {winners}
            </h5>
          </div>
          <div className="border border-primary-800 rounded-xl bg-box p-3 w-[calc(50%-4px)] md:w-full">
            <p className="text-white opacity-50 text-[12px]">
              Your $FORGE staked
            </p>
            <h5 className="font-semibold leading-[1] text-[18px] mt-1">
              {(myForgeStaked ?? 0) / 1000}
            </h5>
          </div>
          <div className="border border-primary-800 rounded-xl bg-box p-3 w-[calc(50%-4px)] md:w-full">
            <p className="text-white opacity-50 text-[12px]">Winning chance</p>
            <h5 className="font-semibold leading-[1] text-[18px] mt-1">
              {winningChance.toFixed(2)}%
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakeForge;
