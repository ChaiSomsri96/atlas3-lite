import { useProfileSlideoverProvider } from "@/frontend/contexts/ProfileSlideoverProvider";
import { useUserDetails } from "@/frontend/hooks/useUserDetails";
import { getRuleText } from "@/pages/project/[projectSlug]/giveaway/[giveawaySlug]";
import { OAuthProviders } from "@/shared/types";
import { shortenPublicKey } from "@/shared/utils";
import { Listbox, Transition } from "@headlessui/react";
import {
  BlockchainNetwork,
  GiveawayRuleType,
  PresaleEntryIntentStatus,
  PresaleStatus,
  Wallet,
} from "@prisma/client";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { RiLoader4Line } from "react-icons/ri";
import { RxArrowRight, RxCheck, RxChevronDown, RxCross2 } from "react-icons/rx";
import { GiSadCrab } from "react-icons/gi";
import { SiHappycow } from "react-icons/si";
import { Confetti } from "./Confetti";
import { Loader } from "../Loader";
import { Input, Label } from "@/styles/FormComponents";
import { ExtendedPresale } from "@/frontend/hooks/usePresale";
import { PresaleEntryActions } from "./PresaleEntryActions";
import { useMarketplacePoints } from "@/frontend/hooks/useMarketplacePoints";
import { PrimaryButton } from "@/styles/BaseComponents";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useHandlePresaleCreateIntent } from "@/frontend/handlers/useHandlePresaleCreateIntent";
import { useHandlePresaleFetchIntent } from "@/frontend/handlers/useHandlePresaleFetchIntent";
import { sleep } from "@/frontend/utils";
import { GetPresaleIntentRequestResponseData } from "@/pages/api/project/[projectSlug]/presale/[presaleSlug]/get-presale-intent";

const CheckIcon = () => (
  <div className="text-primary-500 bg-green-500 rounded-full w-8 h-8 flex justify-center items-center">
    <RxCheck className="h-6 w-6 text-white" />
  </div>
);

const XIcon = () => (
  <div className="text-white bg-red-500 rounded-full w-8 h-8 flex justify-center items-center">
    <RxCross2 className="h-6 w-6 text-white" />
  </div>
);

const LoadingIcon = () => (
  <div className="bg-primary-500 rounded-full w-8 h-8 flex justify-center items-center animate-spin">
    <RiLoader4Line className="h-6 w-6 text-white" />
  </div>
);

const ExclamationIcon = () => (
  <HiOutlineExclamationCircle className="h-8 w-8" />
);

const RequirementRow = ({
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

export const PresaleClosedInfoCard = ({
  presale,
}: {
  presale: ExtendedPresale;
}) => {
  return (
    <div className="w-full md:w-96 h-64 backdrop-blur bg-dark-600/40 md:sticky md:top-12 rounded-lg p-3">
      <div className="flex justify-center items-center h-full flex-col">
        {presale.status === PresaleStatus.FINALIZED && (
          <>
            {presale.entries && presale.entries.length > 0 ? (
              <>
                {presale.entries && presale.entries[0] ? (
                  <div className="flex flex-col items-center gap-4">
                    <Confetti />
                    <div className="w-10 h-10 bg-dark-400 flex items-center justify-center rounded-lg">
                      <SiHappycow className="w-8 h-8" />
                    </div>

                    <p className="font-bold">
                      You are entered into this presale.
                    </p>
                    <div className="mt-3 flex flex-col justify-center text-center">
                      <p className="text-xs mt-2">
                        Your wallet has been submitted into the presale for{" "}
                        {presale.entries[0].entryAmount} NFTs
                      </p>
                      <p className="text-xs mt-2">
                        {shortenPublicKey(presale.entries[0].walletAddress)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 bg-dark-400 flex items-center justify-center rounded-lg">
                      <GiSadCrab className="w-8 h-8" />
                    </div>

                    <div className="flex items-center flex-col mb-3">
                      <p className="font-bold">
                        You did not enter this giveaway
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p>{"You don't have an entry"}</p>
            )}
          </>
        )}
        <PrimaryButton className="mt-5">
          <Link href={"/dashboard"}>
            <div className="flex items-center">My Presales</div>
          </Link>
        </PrimaryButton>
      </div>
    </div>
  );
};

export const PresaleRequirementsCard = ({
  presale,
  refetch,
}: {
  presale: ExtendedPresale;
  refetch: () => void;
}) => {
  const { data: userDetails, isLoading: userDetailsLoading } = useUserDetails();
  const { data: userPoints, refetch: refetchPoints } = useMarketplacePoints();
  const handleCreatePresaleIntentEntry = useHandlePresaleCreateIntent();
  const handleGetPresaleIntentEntry = useHandlePresaleFetchIntent();
  const createGiveawayEntryResult = handleCreatePresaleIntentEntry.data;

  const { setOpen: setProfileOpen } = useProfileSlideoverProvider();
  const [selectedWallet, setSelectedWallet] = useState<Wallet>();
  const [ticketAmount, setTicketAmount] = useState<number>(1);
  const [points, setPoints] = useState<number>();

  const discordAccount = userDetails?.accounts?.find(
    (account) => account.provider === OAuthProviders.DISCORD
  );

  useEffect(() => {
    if (userPoints && userPoints.points) {
      setPoints(userPoints.points);
    }
  }, [userPoints]);

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
      (presale?.network as BlockchainNetwork) ?? BlockchainNetwork.Solana
    ];
  const defaultWallet = networkWallets?.find((wallet) => wallet.isDefault);

  useEffect(() => {
    if (defaultWallet) {
      setSelectedWallet(defaultWallet);
    }
  }, [defaultWallet]);

  const requiresDiscordAccount = !!presale.rules.find(
    (rule) =>
      rule.type === GiveawayRuleType.DISCORD_GUILD ||
      rule.type === GiveawayRuleType.DISCORD_ROLE
  );

  const requiresTwitterAccount = !!presale.rules.find(
    (rule) =>
      rule.type === GiveawayRuleType.TWITTER_FRIENDSHIP ||
      rule.type === GiveawayRuleType.TWITTER_TWEET
  );

  const requirementsCount =
    presale.rules.length +
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

  const [entering, setEntering] = useState(false);

  // Inside your component
  const handleEnterGiveaway = async () => {
    const toastId = toast.loading(
      "Entering presale, this may take several minutes. BE PATIENT AND DO NOT CLOSE OR REFRESH THIS TAB."
    );
    setEntering(true);
    handleCreatePresaleIntentEntry.mutate(
      {
        presale,
        wallet: selectedWallet,
        amount: ticketAmount,
      },
      {
        onSuccess: async (result) => {
          if (!result.isSuccess) {
            toast.error("Failed to meet requirements", { id: toastId });
            setEntering(false);
            return;
          }
          let intent: GetPresaleIntentRequestResponseData | undefined;
          for (let i = 0; i < 150; i++) {
            try {
              intent = await handleGetPresaleIntentEntry.mutateAsync({
                presale,
                intentId: result.intentId,
              });

              console.log(intent);

              if (intent.intent.status !== PresaleEntryIntentStatus.PENDING) {
                break;
              }
            } catch {}
            await sleep(3 * 1000); // 5 sec
          }

          if (
            intent &&
            intent.intent.status === PresaleEntryIntentStatus.SUCCESS
          ) {
            toast.success("Entered successfully", {
              id: toastId,
              duration: 7000,
            });
          } else if (
            intent &&
            intent.intent.status === PresaleEntryIntentStatus.FAILED
          ) {
            if (intent.intent.error) {
              toast.error(intent.intent.error, { id: toastId });
            }
          } else {
            toast.success("Failed to join, please try again later.", {
              id: toastId,
            });
          }

          refetch();
          refetchPoints();
          setEntering(false);
        },
        onError: (error) => {
          toast.error((error as Error).message, { id: toastId });
          setEntering(false);
        },
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const entryAmount =
      presale.entries && presale.entries[0]
        ? presale.entries[0].entryAmount
        : 0;
    const maxValue = presale.maxSupplyPerUser - entryAmount;

    if (value <= maxValue) {
      setTicketAmount(value);
    } else {
      setTicketAmount(maxValue);
    }
  };

  return (
    <div className="w-full md:w-96 backdrop-blur bg-dark-600/40 md:sticky md:top-12 rounded-lg p-3">
      <div className="border-b-2 border-dark-400 pb-2">
        <p className="text-lg font-semibold">Entry Requirements</p>
        <p className="text-sm text-gray-400">
          {presale.entries?.length
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
            ) : presale.entries?.length || discordAccount ? (
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
                `@${discordAccount.username}`
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
            ) : presale.entries?.length || twitterAccount ? (
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
      <RequirementRow
        icon={
          userDetailsLoading ? (
            <LoadingIcon />
          ) : presale.entries?.length ||
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
            {presale.network ?? presale.project.network} Wallet
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
                Add {presale.network ?? presale.project.network} wallet
                <RxArrowRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </RequirementRow>

      {/* Rules */}
      {presale.rules.map((rule, ruleIdx) => (
        <RequirementRow
          key={`rule-${ruleIdx}-${rule.id}`}
          icon={
            createGiveawayEntryResult ? (
              createGiveawayEntryResult.results.find(
                (result) => result.rule.id === rule.id
              )?.error ? (
                <XIcon />
              ) : (
                <CheckIcon />
              )
            ) : handleCreatePresaleIntentEntry.isLoading ? (
              <LoadingIcon />
            ) : presale.entries?.length ? (
              <CheckIcon />
            ) : (
              <ExclamationIcon />
            )
          }
          hasBottomBorder={ruleIdx !== presale.rules.length - 1}
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

      <div className="mt-2">
        <div className="">
          <span className="text-greenc">
            Price: {presale.pointsCost / 1000}{" "}
            <img
              src="/images/Atlas3Points.png"
              className="w-4 h-4 mr-2 inline"
              alt="Points"
            />{" "}
          </span>
          <p className="">Max Purchase Limit: {presale.maxSupplyPerUser}</p>
          <div className="flex justify-between text-md">
            <span className="text-greenc">Total Sold</span>
            <span className="text-greenc">
              ({presale.entryCount}/{presale.supply})
            </span>
          </div>
        </div>
        <div className="w-full h-8 bg-grayc2 my-2 rounded-lg relative">
          <div className="relative">
            <div
              className="h-9 rounded-lg absolute z-20"
              style={{
                background:
                  "linear-gradient(90deg, #29A3FF 4.49%, rgba(41, 255, 229, 0.14) 92.22%)",
                width: presale.supply
                  ? Math.min(100 * (presale.entryCount / presale.supply)) + "%"
                  : "0%",
              }}
            />
            <div className="h-9 rounded-lg bg-gray-700/50  absolute w-full z-0" />
          </div>
          <p className="text-greenc absolute inset-0 text-center leading-9 text-xl">
            {presale.supply
              ? Math.min(100 * (presale.entryCount / presale.supply)).toFixed(0)
              : "0"}
            %
          </p>
        </div>
      </div>

      <div className="my-4">
        <Label>Purchase amount:</Label>
        <Input
          type="number"
          step={1}
          onWheel={() => {
            if (document.activeElement instanceof HTMLElement) {
              document?.activeElement?.blur();
            }
          }}
          id="ticketAmount"
          onChange={handleInputChange}
          value={ticketAmount}
        />
        {ticketAmount ? (
          <p className="text-sm text-gray-400 mt-2">
            {`Your Cost: ${(presale.pointsCost / 1000) * ticketAmount}`}
            <img
              src="/images/Atlas3Points.png"
              className="w-3 h-3 ml-1 inline"
              alt="Points"
            />
          </p>
        ) : (
          ""
        )}
      </div>

      <PresaleEntryActions
        presale={presale}
        isCreatingEntry={entering}
        createPresaleEntryCallback={handleEnterGiveaway}
        points={points}
        refetchPoints={refetchPoints}
      />
    </div>
  );
};
