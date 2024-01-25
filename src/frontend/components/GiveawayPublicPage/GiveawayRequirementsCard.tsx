import { useProfileSlideoverProvider } from "@/frontend/contexts/ProfileSlideoverProvider";
import { useHandleCreateGiveawayEntry } from "@/frontend/handlers/useHandleCreateGiveawayEntry";
import { ExtendedGiveaway } from "@/frontend/hooks/useGiveaway";
import { useUserDetails } from "@/frontend/hooks/useUserDetails";
import { getRuleText } from "@/pages/project/[projectSlug]/giveaway/[giveawaySlug]";
import { OAuthProviders } from "@/shared/types";
import { shortenPublicKey } from "@/shared/utils";
import { Listbox, Transition } from "@headlessui/react";
import {
  BlockchainNetwork,
  GiveawayRuleType,
  GiveawayStatus,
  GiveawayType,
  TransactionStatus,
  Wallet,
} from "@prisma/client";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { RiLoader4Line } from "react-icons/ri";
import { RxArrowRight, RxCheck, RxChevronDown, RxCross2 } from "react-icons/rx";
import { GiveawayEntryActions } from "./GiveawayEntryActions";
import { GiSadCrab } from "react-icons/gi";
import { SiHappycow } from "react-icons/si";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Confetti } from "./Confetti";
import { Loader } from "../Loader";
import { Input, Label } from "@/styles/FormComponents";
import { toast } from "react-hot-toast";
import { enterGiveawayWithMemo } from "@/frontend/utils/enterGiveawayWithMemo";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VAULT_PUBLIC_KEY } from "@/shared/constants";
import { useSession } from "next-auth/react";
import { useHandleValidateEnterGiveaway } from "@/frontend/handlers/useHandleValidateEnterGiveaway";
import { useHandleFetchTransaction } from "@/frontend/handlers/useHandleFetchTransaction";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const CheckIcon = () => (
  <div className="text-primary-500 bg-green-500 rounded-full w-8 h-8 flex justify-center items-center">
    <RxCheck className="h-6 w-6 text-white" />
  </div>
);

export const XIcon = () => (
  <div className="text-white bg-red-500 rounded-full w-8 h-8 flex justify-center items-center">
    <RxCross2 className="h-6 w-6 text-white" />
  </div>
);

export const LoadingIcon = () => (
  <div className="bg-primary-500 rounded-full w-8 h-8 flex justify-center items-center animate-spin">
    <RiLoader4Line className="h-6 w-6 text-white" />
  </div>
);

export const ExclamationIcon = () => (
  <HiOutlineExclamationCircle className="h-8 w-8" />
);

export const RequirementRow = ({
  children,
  icon,
  hasBottomBorder,
}: {
  children: ReactNode;
  icon: ReactNode;
  hasBottomBorder?: boolean;
}) => (
  <div
    className={`flex py-5 px-2 gap-3 items-center ${
      hasBottomBorder && "border-b-2 border-dark-400"
    }`}
  >
    <div>{icon}</div>
    {children}
  </div>
);

export const GiveawayClosedInfoCard = ({
  giveaway,
}: {
  giveaway: ExtendedGiveaway;
}) => {
  return (
    <div className="w-full md:w-96 h-64 backdrop-blur bg-dark-600/40 md:sticky md:top-12 rounded-lg p-3">
      <div className="flex justify-center items-center h-full flex-col">
        {giveaway.status === GiveawayStatus.RUNNING && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 bg-dark-400 flex items-center justify-center rounded-lg">
              <AiOutlineLoading3Quarters className="w-6 h-6 animate animate-spin" />
            </div>

            <p className="font-bold text-center">
              Picking winners, please check in a few moments.
            </p>
          </div>
        )}

        {giveaway.status === GiveawayStatus.FINALIZED && (
          <>
            {giveaway.entries && giveaway.entries.length > 0 ? (
              <>
                {giveaway.entries && giveaway.entries[0].isWinner ? (
                  <div className="flex flex-col items-center gap-4">
                    <Confetti />
                    <div className="w-10 h-10 bg-dark-400 flex items-center justify-center rounded-lg">
                      <SiHappycow className="w-8 h-8" />
                    </div>

                    <p className="font-bold">You won the giveaway</p>
                    <div className="mt-3 flex flex-col justify-center text-center">
                      <p className="text-xs mt-2">
                        Your wallet has been submitted for the giveaway, and you
                        will receive a discord role if applicable. Please sit
                        back and relax.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 bg-dark-400 flex items-center justify-center rounded-lg">
                      <GiSadCrab className="w-8 h-8" />
                    </div>

                    <div className="flex items-center flex-col mb-3">
                      <p className="font-bold">You did not win the giveaway</p>
                      <p className="text-xs">which is kinda sad</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p>{"You don't have an entry"}</p>
            )}
          </>
        )}

        {/* <p>Giveaway is now Closed</p> */}
      </div>
    </div>
  );
};

export const GiveawayRequirementsCard = ({
  giveaway,
}: {
  giveaway: ExtendedGiveaway;
}) => {
  const { data: userDetails, isLoading: userDetailsLoading } = useUserDetails();
  const handleCreateGiveawayEntry = useHandleCreateGiveawayEntry();
  const handleValidateEnterGiveaway = useHandleValidateEnterGiveaway();
  const handleFetchTransaction = useHandleFetchTransaction();
  const createGiveawayEntryResult =
    handleCreateGiveawayEntry.data ?? handleValidateEnterGiveaway.data;
  const [entryCount, setEntryCount] = useState<number>(
    giveaway?.entries?.length ? giveaway.entries[0].entryAmount : 0
  );
  const [walletAddress, setWalletAddress] = useState<string>(
    giveaway?.entries?.length ? giveaway.entries[0].walletAddress : ""
  );

  const { setOpen: setProfileOpen } = useProfileSlideoverProvider();
  const [selectedWallet, setSelectedWallet] = useState<Wallet>();
  const [ticketAmount, setTicketAmount] = useState<number>(1);

  const { connection } = useConnection();
  const solanaWallet = useWallet();
  const { data: session } = useSession();

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (giveaway && session && session.user) {
      setDataLoaded(true);
    }
  }, [giveaway, session]);

  useEffect(() => {
    if (dataLoaded) {
      handleValidateEnterGiveaway.mutate({
        projectSlug: giveaway.project.slug,
        giveawaySlug: giveaway.slug,
      });
    }
  }, [dataLoaded]);

  const discordAccount = userDetails?.accounts?.find(
    (account) => account.provider === OAuthProviders.DISCORD
  );

  const twitterAccount = userDetails?.accounts?.find(
    (account) => account.provider === OAuthProviders.TWITTER
  );

  const walletMap = userDetails?.wallets?.reduce((acc, wallet) => {
    if (!acc[wallet.network]) {
      acc[wallet.network] = [];
    }

    acc[wallet.network].push(wallet);

    return acc;
  }, {} as Record<BlockchainNetwork, typeof userDetails.wallets>);

  const networkWallets =
    walletMap?.[
      (giveaway?.network as BlockchainNetwork) ?? BlockchainNetwork.Solana
    ];
  const defaultWallet = networkWallets?.find(
    (wallet) =>
      wallet.isDefault ||
      (giveaway.network === BlockchainNetwork.Bitcoin &&
        wallet.address.startsWith("bc1p"))
  );

  useEffect(() => {
    if (defaultWallet) {
      setSelectedWallet(defaultWallet);
    }
  }, [defaultWallet]);

  const requiresDiscordAccount = !!giveaway.rules.find(
    (rule) =>
      rule.type === GiveawayRuleType.DISCORD_GUILD ||
      rule.type === GiveawayRuleType.DISCORD_ROLE
  );

  const requiresTwitterAccount = !!giveaway.rules.find(
    (rule) =>
      rule.type === GiveawayRuleType.TWITTER_FRIENDSHIP ||
      rule.type === GiveawayRuleType.TWITTER_TWEET
  );

  const requirementsCount =
    giveaway.rules.length +
    1 + // For wallet
    (requiresDiscordAccount ? 1 : 0) +
    (requiresTwitterAccount ? 1 : 0);

  const completedRequirementsCount =
    (selectedWallet ? 1 : 0) +
    (requiresDiscordAccount && discordAccount ? 1 : 0) +
    (requiresTwitterAccount && twitterAccount ? 1 : 0) +
    (createGiveawayEntryResult
      ? createGiveawayEntryResult?.results.filter((result) => !result.error)
          .length
      : 0);

  const depositToken = async () => {
    if (!giveaway.paymentTokenAmount || !giveaway.paymentToken) {
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
    const amount = ticketAmount * giveaway.paymentTokenAmount;
    try {
      const txSignature = await enterGiveawayWithMemo({
        connection,
        wallet: solanaWallet,
        walletAddress: selectedWallet?.address ?? "",
        to: VAULT_PUBLIC_KEY,
        mint: giveaway.paymentToken.tokenAddress,
        amount,
        ticketAmount,
        giveawayId: giveaway.id,
        tokenId: giveaway.paymentToken.id,
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
        setEntryCount(entryCount + ticketAmount);
        setWalletAddress(selectedWallet?.address ?? "");
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
    if (!giveaway.paymentToken) {
      handleCreateGiveawayEntry.mutate({
        giveaway,
        wallet: selectedWallet,
      });
    } else {
      if (!giveaway.paymentTokenAmount || !giveaway.paymentToken) {
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
      handleValidateEnterGiveaway.mutate(
        {
          projectSlug: giveaway.project.slug,
          giveawaySlug: giveaway.slug,
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
    }
  };

  if (
    giveaway.type === GiveawayType.FCFS &&
    giveaway.entries &&
    giveaway.entries.length > 0
  ) {
    return (
      <div className="w-full md:w-96 backdrop-blur bg-dark-600/40 md:sticky md:top-12 rounded-lg p-3">
        <div className="flex flex-col items-center gap-4 h-48 justify-center">
          <Confetti />
          <div className="w-10 h-10 bg-dark-400 flex items-center justify-center rounded-lg">
            <SiHappycow className="w-8 h-8" />
          </div>

          <p className="font-bold">You won the giveaway</p>
          <div className="mt-3 flex flex-col justify-center text-center">
            <p className="text-xs mt-2">
              Your wallet has been submitted for the giveaway, and you will
              receive a discord role if applicable. Please sit back and relax.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-96 backdrop-blur bg-dark-600/40 md:sticky md:top-12 rounded-lg p-3">
      <div className="border-b-2 border-dark-400 pb-2">
        <p className="text-lg font-semibold">Entry Requirements</p>
        <p className="text-sm text-gray-400">
          {giveaway.entries?.length
            ? `${requirementsCount} of ${requirementsCount} TASKS COMPLETED`
            : `${completedRequirementsCount} of ${requirementsCount} TASKS COMPLETED`}
        </p>
      </div>

      {/* Check Discord Account */}
      {requiresDiscordAccount && (
        <RequirementRow
          icon={
            userDetailsLoading ? (
              <LoadingIcon />
            ) : giveaway.entries?.length || discordAccount ? (
              <CheckIcon />
            ) : (
              <XIcon />
            )
          }
          hasBottomBorder={true}
        >
          <div>
            <div className="text-sm">Discord Account</div>
            <p className="text-sm text-gray-400">
              {userDetailsLoading ? (
                <Loader />
              ) : discordAccount ? (
                `${discordAccount.username}`
              ) : (
                <span
                  className="inline-flex hover:cursor-pointer"
                  onClick={() => setProfileOpen(true)}
                >
                  Connect Discord account
                  <RxArrowRight className="h-5 w-5" />
                </span>
              )}
            </p>
          </div>
        </RequirementRow>
      )}

      {/* Check Twitter Account */}
      {requiresTwitterAccount && (
        <RequirementRow
          icon={
            userDetailsLoading ? (
              <LoadingIcon />
            ) : giveaway.entries?.length || twitterAccount ? (
              <CheckIcon />
            ) : (
              <XIcon />
            )
          }
          hasBottomBorder={true}
        >
          <div>
            <div className="text-sm">Twitter Account</div>
            <p className="text-sm text-gray-400">
              {userDetailsLoading ? (
                <Loader />
              ) : twitterAccount ? (
                `@${twitterAccount.username}`
              ) : (
                <span
                  className="inline-flex hover:cursor-pointer"
                  onClick={() => setProfileOpen(true)}
                >
                  Connect Twitter account
                  <RxArrowRight className="h-5 w-5" />
                </span>
              )}
            </p>
          </div>
        </RequirementRow>
      )}

      {/* Check Wallet */}
      {giveaway.network !== "TBD" && (
        <RequirementRow
          icon={
            userDetailsLoading ? (
              <LoadingIcon />
            ) : giveaway.entries?.length ||
              (networkWallets && networkWallets.length) ? (
              <CheckIcon />
            ) : (
              <XIcon />
            )
          }
          hasBottomBorder={true}
        >
          <div>
            <div className="text-sm">
              {giveaway.network ?? giveaway.project.network} Wallet
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {userDetailsLoading ? (
                <Loader />
              ) : defaultWallet ? (
                <Listbox value={selectedWallet} onChange={setSelectedWallet}>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg  pr-8 text-left shadow-md sm:text-sm">
                      <span className="block truncate">
                        {shortenPublicKey(selectedWallet?.address)}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <RxChevronDown
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute mt-1 w-56 max-h-60 overflow-auto rounded-md bg-dark-500 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {networkWallets?.map((wallet, walletIdx) => (
                          <Listbox.Option
                            key={`wallet-${walletIdx}-${wallet.address}`}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 mx-1 rounded-lg ${
                                active
                                  ? "bg-gray-500 text-gray-100"
                                  : "text-gray-200"
                              }`
                            }
                            value={wallet}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {shortenPublicKey(wallet.address)}
                                  {defaultWallet.address === wallet.address
                                    ? " (Primary)"
                                    : ""}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-400">
                                    <RxCheck
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              ) : (
                <span
                  className="inline-flex hover:cursor-pointer"
                  onClick={() => setProfileOpen(true)}
                >
                  Add {giveaway.network ?? giveaway.project.network} wallet
                  <RxArrowRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        </RequirementRow>
      )}

      {/* Rules */}
      {giveaway.rules.map((rule, ruleIdx) => (
        <RequirementRow
          key={`rule-${ruleIdx}-${rule.id}`}
          icon={
            rule.type === GiveawayRuleType.TWITTER_FRIENDSHIP ||
            rule.type === GiveawayRuleType.TWITTER_TWEET ? (
              <ExclamationIcon />
            ) : createGiveawayEntryResult ? (
              createGiveawayEntryResult.results.find(
                (result) => result.rule.id === rule.id
              )?.error ? (
                <XIcon />
              ) : (
                <CheckIcon />
              )
            ) : handleCreateGiveawayEntry.isLoading ||
              handleValidateEnterGiveaway.isLoading ? (
              <LoadingIcon />
            ) : giveaway.entries?.length ? (
              <CheckIcon />
            ) : (
              <ExclamationIcon />
            )
          }
          hasBottomBorder={ruleIdx !== giveaway.rules.length - 1}
        >
          <div>
            <div className="text-sm">{getRuleText(rule)}</div>
            <p className="text-xs text-gray-400 ">
              {createGiveawayEntryResult?.results.find(
                (result) => result.rule.id === rule.id
              )?.error &&
                createGiveawayEntryResult.results.find(
                  (result) => result.rule.id === rule.id
                )?.error}
            </p>
          </div>
        </RequirementRow>
      ))}

      {giveaway.paymentToken && giveaway.paymentTokenAmount && (
        <div className="my-4">
          <Label>Ticket amount:</Label>
          <Input
            type="number"
            step={1}
            onWheel={() => {
              if (document.activeElement instanceof HTMLElement) {
                document?.activeElement?.blur();
              }
            }}
            id="ticketAmount"
            onChange={(e) => setTicketAmount(Number(e.target.value))}
            defaultValue={1}
          />
          {ticketAmount && (
            <p className="text-sm text-gray-400 mt-2">
              {`Ticket Cost: ${giveaway.paymentTokenAmount * ticketAmount} $${
                giveaway.paymentToken.tokenName
              }`}
            </p>
          )}
        </div>
      )}

      <GiveawayEntryActions
        giveaway={giveaway}
        isCreatingEntry={
          handleCreateGiveawayEntry.isLoading ||
          handleValidateEnterGiveaway.isLoading
        }
        createGiveawayEntryCallback={handleEnterGiveaway}
        buyTicketCallback={depositToken}
        entryCount={
          createGiveawayEntryResult?.entry
            ? createGiveawayEntryResult.entry.entryAmount
            : entryCount
        }
        walletAddress={
          createGiveawayEntryResult?.entry
            ? createGiveawayEntryResult.entry.walletAddress
            : walletAddress
        }
      />
    </div>
  );
};
