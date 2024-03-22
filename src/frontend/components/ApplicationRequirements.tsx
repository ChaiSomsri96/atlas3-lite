import { Fragment, useEffect, useState } from "react";
import { useProfileSlideoverProvider } from "../contexts/ProfileSlideoverProvider";
import { useUserDetails } from "../hooks/useUserDetails";
import { OAuthProviders } from "@/shared/types";
import { BlockchainNetwork, GiveawayRuleType, Wallet } from "@prisma/client";
import {
  CheckIcon,
  ExclamationIcon,
  LoadingIcon,
  RequirementRow,
  XIcon,
} from "./GiveawayPublicPage/GiveawayRequirementsCard";
import { RxArrowRight, RxCheck, RxChevronDown } from "react-icons/rx";
import { Listbox, Transition } from "@headlessui/react";
import { shortenPublicKey } from "@/shared/utils";
import { useSession } from "next-auth/react";
import { getRuleText } from "@/pages/project/[projectSlug]/giveaway/[giveawaySlug]";
import { ExtendedProjectApplication } from "@/pages/api/me/applications";
import { useHandleValidateApplicationRules } from "../handlers/useHandleValidateApplicationRules";

export const ApplicationRequirements = ({
  setRequirementsValidated,
  application,
  setSelectedApplication,
}: {
  setRequirementsValidated: (value: boolean) => void;
  application: ExtendedProjectApplication;
  setSelectedApplication: (value: ExtendedProjectApplication | null) => void;
}) => {
  const { data: userDetails, isLoading: userDetailsLoading } = useUserDetails();
  const { data: session } = useSession();

  const { setOpen: setProfileOpen } = useProfileSlideoverProvider();
  const [selectedWallet, setSelectedWallet] = useState<Wallet>();

  const [dataLoaded, setDataLoaded] = useState(false);
  const [revalidate, setRevalidate] = useState(false);
  const handleRules = useHandleValidateApplicationRules();
  const ruleResults = handleRules.data;

  useEffect(() => {
    if (session && session.user) {
      setDataLoaded(true);
    }
  }, [session]);

  useEffect(() => {
    if (dataLoaded) {
      handleRules.mutate({
        id: application.id,
      });
    }
  }, [dataLoaded]);

  useEffect(() => {
    const validate = async () => {
      await handleRules.mutateAsync({
        id: application.id,
      });

      if (ruleResults && ruleResults.isSuccess) {
        setRequirementsValidated(true);
      } else {
        setRevalidate(false);
      }
    };

    if (revalidate) {
      validate();
    }
  }, [revalidate]);

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

  const networkWallets = walletMap?.[BlockchainNetwork.Solana];
  const defaultWallet = networkWallets?.find((wallet) => wallet.isDefault);

  const validateMeeListRules = async () => {
    if (ruleResults && ruleResults.isSuccess) {
      setRequirementsValidated(true);
    } else {
      setRequirementsValidated(false);
      setRevalidate(true);
    }
  };

  useEffect(() => {
    if (defaultWallet) {
      setSelectedWallet(defaultWallet);
    }
  }, [defaultWallet]);

  const requiresDiscordAccount = true;

  const requiresTwitterAccount = true;

  return (
    <>
      <div className="w-full md:w-96 backdrop-blur bg-dark-600/40  md:top-12 rounded-lg p-3">
        <div className="border-b-2 border-dark-400 pb-2">
          <p className="text-lg font-semibold">Application Requirements</p>
        </div>

        {/* Check Discord Account */}
        {requiresDiscordAccount && (
          <RequirementRow
            icon={
              userDetailsLoading ? (
                <LoadingIcon />
              ) : discordAccount ? (
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
                  <></>
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
              ) : twitterAccount ? (
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
                  <></>
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
            ) : networkWallets && networkWallets.length ? (
              <CheckIcon />
            ) : (
              <XIcon />
            )
          }
          hasBottomBorder={true}
        >
          <div>
            <div className="text-sm">Solana Wallet</div>
            <div className="text-xs text-gray-400 mt-1">
              {userDetailsLoading ? (
                <></>
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
                  Add Solana wallet
                  <RxArrowRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>
        </RequirementRow>

        {/* Rules */}
        {application.requirements.map((rule, ruleIdx) => (
          <RequirementRow
            key={`rule-${ruleIdx}-${rule.id}`}
            icon={
              rule.type === GiveawayRuleType.TWITTER_FRIENDSHIP ? (
                <ExclamationIcon />
              ) : ruleResults ? (
                ruleResults.results.find((result) => result.rule.id === rule.id)
                  ?.error ? (
                  <XIcon />
                ) : (
                  <CheckIcon />
                )
              ) : handleRules.isLoading ? (
                <LoadingIcon />
              ) : (
                <ExclamationIcon />
              )
            }
            hasBottomBorder={ruleIdx !== application.requirements.length - 1}
          >
            <div>
              <div className="text-sm">{getRuleText(rule)}</div>
              <p className="text-xs text-gray-400 ">
                {ruleResults?.results.find(
                  (result) => result.rule.id === rule.id
                )?.error &&
                  ruleResults.results.find(
                    (result) => result.rule.id === rule.id
                  )?.error}
              </p>
            </div>
          </RequirementRow>
        ))}
      </div>
      <div className="flex flex-row items-center justify-center gap-2">
        <button
          onClick={() => {
            setSelectedApplication(null);
          }}
          className="flex mt-5 items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700"
        >
          Back
        </button>
        <button
          onClick={() => {
            validateMeeListRules();
          }}
          className="flex mt-5 items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700"
        >
          Next
        </button>
      </div>
    </>
  );
};
