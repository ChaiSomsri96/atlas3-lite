import { Fragment, useState } from "react";
import { Dialog, Disclosure, Transition } from "@headlessui/react";
import { RxChevronRight, RxCross2, RxStar, RxStarFilled } from "react-icons/rx";

import clsx from "clsx";
import { SiDiscord, SiTwitter } from "react-icons/si";

import { useUserDetails } from "@/frontend/hooks/useUserDetails";
import { BlockchainNetwork } from "@prisma/client";
import Tippy from "@tippyjs/react";
import { OAuthProviders } from "@/shared/types";
import { signIn, signOut } from "next-auth/react";
import { useHandleUnlinkAccount } from "../handlers/useHandleUnlinkAccount";
import { useHandleSetPrimaryWallet } from "../handlers/useHandleSetPrimaryWallet";
import { useHandleDeleteWallet } from "../handlers/useHandleDeleteWallet";
import { SolanaConnectButton } from "./SolanaConnectButton";
import { shortenPublicKey } from "@/shared/utils";
import { EthereumConnectButton } from "./EthereumConnectButton";
import { Button, LinkAccountCard } from "@/styles/BaseComponents";
import tw from "twin.macro";
import { AptosConnectModal } from "./AptosConnectModal";
import { SuiConnectButton } from "./SuiConnectButton";
import { CloseSquare } from "iconsax-react";
import { useHandleDeleteUser } from "../handlers/useHandleDeleteUser";
import { CardanoConnectButton } from "./CardanoConnectButton";
import { BitcoinConnectModal } from "./BitcoinConnectModal";
import { ManualConnectButton } from "./ManualConnectButton";

const LogoutButton = tw(
  Button
)`bg-red-500/10 text-red-500 w-full hover:bg-red-500/20`;

const ChainConnectButton = {
  [BlockchainNetwork.Solana]: <SolanaConnectButton />,
  [BlockchainNetwork.Ethereum]: (
    <EthereumConnectButton network={BlockchainNetwork.Ethereum} />
  ),
  [BlockchainNetwork.Polygon]: (
    <EthereumConnectButton network={BlockchainNetwork.Polygon} />
  ),
  [BlockchainNetwork.Aptos]: <AptosConnectModal />,
  [BlockchainNetwork.Sui]: <SuiConnectButton />,
  [BlockchainNetwork.Cardano]: <CardanoConnectButton />,
  [BlockchainNetwork.Bitcoin]: <BitcoinConnectModal />,
  [BlockchainNetwork.Avax]: (
    <ManualConnectButton network={BlockchainNetwork.Avax} />
  ),
  [BlockchainNetwork.Venom]: (
    <ManualConnectButton network={BlockchainNetwork.Venom} />
  ),
  [BlockchainNetwork.Injective]: (
    <ManualConnectButton network={BlockchainNetwork.Injective} />
  ),
  [BlockchainNetwork.Sei]: (
    <ManualConnectButton network={BlockchainNetwork.Sei} />
  ),
  [BlockchainNetwork.TBD]: <></>,
};

const WalletSection = () => {
  const { data: userDetails, isLoading: userDetailsLoading } = useUserDetails();
  const handleSetPrimaryWallet = useHandleSetPrimaryWallet();
  const handleDeleteWallet = useHandleDeleteWallet();
  const walletMap = userDetails?.wallets?.reduce((acc, wallet) => {
    if (!acc[wallet.network]) {
      acc[wallet.network] = [];
    }

    acc[wallet.network].push(wallet);

    return acc;
  }, {} as Record<BlockchainNetwork, typeof userDetails.wallets>);

  return (
    <div className="mt-8 font-sans">
      <p className="text-lg font-semibold">Wallets</p>
      <p className="text-sm">
        Add multiple wallets to verify token ownership. All of these wallets can
        also access your profile
      </p>

      {userDetailsLoading ? (
        // Skeletons
        <div className="animate-pulse space-y-2 mt-3">
          <div className="w-full h-16 bg-dark-500 rounded-lg dark:bg-gray-700"></div>
          <div className="w-full h-16 bg-dark-500 rounded-lg dark:bg-gray-700"></div>
          <div className="w-full h-16 bg-dark-500 rounded-lg dark:bg-gray-700"></div>
        </div>
      ) : (
        <dl className="space-y-6 divide-y divide-dark-500 mb-14">
          {Object.values(BlockchainNetwork)
            .filter((x) => x !== "TBD")
            .map((chain) => (
              <Disclosure as="div" key={chain} className="pt-6">
                {({ open }) => (
                  <>
                    <dt className="flex justify-between text-lg w-full">
                      <Disclosure.Button className="flex gap-3 text-left">
                        <RxChevronRight
                          className={clsx(
                            open ? "rotate-90" : "rotate-0",
                            "h-6 w-6 transform mt-1 transition-all duration-200"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-100">
                            {chain} Wallets
                          </span>
                          <span className="font-light text-gray-400 text-xs">
                            {walletMap?.[chain]?.length ?? "0"} Wallet
                            {walletMap?.[chain]?.length === 1 ? "" : "s"}{" "}
                            Connected
                          </span>
                        </div>
                      </Disclosure.Button>

                      {ChainConnectButton[chain]}
                    </dt>

                    <Transition
                      show={open}
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel as="dd" className="my-5" static>
                        {walletMap?.[chain]?.map((wallet) => (
                          <div
                            className="flex gap-2 my-2"
                            key={`wallet-${wallet.network}-${wallet.address}`}
                          >
                            <div className="flex justify-between items-center bg-dark-400 w-full px-3 py-2 rounded-lg">
                              <span className="text-sm">
                                {shortenPublicKey(wallet.address)}
                              </span>

                              {wallet.isDefault ? (
                                <Tippy content="Primary Wallet" theme="light">
                                  <RxStarFilled className="h-5 w-5 text-primary-500" />
                                </Tippy>
                              ) : (
                                <Tippy content="Set as primary" theme="light">
                                  <RxStar
                                    className="h-5 w-5 hover:text-primary-500 hover:cursor-pointer"
                                    onClick={() => {
                                      handleSetPrimaryWallet.mutate({
                                        address: wallet.address,
                                        network: wallet.network,
                                      });
                                    }}
                                  />
                                </Tippy>
                              )}
                            </div>

                            <button
                              className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-300 hover:bg-opacity-10 text-sm font-medium"
                              onClick={() => {
                                handleDeleteWallet.mutate({
                                  address: wallet.address,
                                  network: wallet.network,
                                });
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
            ))}
        </dl>
      )}
    </div>
  );
};

const SocialSection = () => {
  const { data: userDetails, isLoading: userDetailsLoading } = useUserDetails();
  const handleUnlinkAccount = useHandleUnlinkAccount();

  const discordAccount = userDetails?.accounts?.find(
    (account) => account.provider === OAuthProviders.DISCORD
  );

  const twitterAccount = userDetails?.accounts?.find(
    (account) => account.provider === OAuthProviders.TWITTER
  );

  return (
    <div className="mt-8">
      <p className="text-lg font-semibold">Social Accounts</p>

      {userDetailsLoading ? (
        <div className="animate-pulse space-y-2 mt-3">
          <div className="w-full h-24 bg-dark-500 rounded-lg dark:bg-gray-700"></div>
          <div className="w-full h-24 bg-dark-500 rounded-lg dark:bg-gray-700"></div>
          <div className="w-full h-10 bg-dark-500 rounded-lg dark:bg-gray-700"></div>
        </div>
      ) : (
        <div className="space-y-3 mt-3">
          <LinkAccountCard provider={OAuthProviders.TWITTER}>
            {twitterAccount ? (
              <>
                <div className="flex justify-between items-center gap-3 ">
                  <SiTwitter className="h-5 w-5 text-twitter" />
                  {twitterAccount?.image && (
                    <img
                      src={twitterAccount?.image}
                      className="h-5 w-5 rounded-lg"
                      alt="Account Image"
                    />
                  )}

                  <span className="text-sm">{twitterAccount?.username}</span>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-red-500 hover:bg-dark-900 hover:bg-opacity-30 text-sm font-medium"
                  onClick={() =>
                    handleUnlinkAccount.mutate({
                      provider: OAuthProviders.TWITTER,
                    })
                  }
                >
                  Disconnect
                </button>
              </>
            ) : (
              <div
                className="flex flex-col justify-center items-center gap-2 w-full hover:cursor-pointer"
                onClick={() => signIn(OAuthProviders.TWITTER)}
              >
                <SiTwitter className="h-5 w-5 text-twitter" />
                <span className="text-sm">Connect your Twitter Account</span>
              </div>
            )}
          </LinkAccountCard>
          <LinkAccountCard provider={OAuthProviders.DISCORD}>
            {discordAccount ? (
              <>
                <div className="flex justify-between items-center gap-3 ">
                  <SiDiscord className="h-5 w-5 text-discord" />
                  {discordAccount?.image && (
                    <img
                      src={discordAccount?.image}
                      className="h-5 w-5 rounded-lg"
                      alt="Account Image"
                    />
                  )}

                  <span className="text-sm">{discordAccount?.username}</span>
                </div>

                <button
                  className="px-4 py-2 rounded-lg text-red-500 hover:bg-dark-900 hover:bg-opacity-30 text-sm font-medium"
                  onClick={() =>
                    handleUnlinkAccount.mutate({
                      provider: OAuthProviders.DISCORD,
                    })
                  }
                >
                  Disconnect
                </button>

                <button
                  className="px-4 py-2 rounded-lg text-red-500 hover:bg-dark-900 hover:bg-opacity-30 text-sm font-medium"
                  onClick={() => signIn(OAuthProviders.DISCORD)}
                >
                  Relink
                </button>
              </>
            ) : (
              <div
                className="flex flex-col justify-center items-center gap-2 w-full hover:cursor-pointer"
                onClick={() => signIn(OAuthProviders.DISCORD)}
              >
                <SiDiscord className="h-5 w-5 text-[#5865F2]" />
                <span className="text-sm">Connect your Discord Account</span>
              </div>
            )}
          </LinkAccountCard>

          <LogoutButton
            // className="mt-3 w-full px-4 py-2 rounded-lg text-red-500 bg-red-500 bg-opacity-5 hover:bg-opacity-10 text-sm font-medium mr-3"
            onClick={() => signOut()}
          >
            Logout
          </LogoutButton>
        </div>
      )}
    </div>
  );
};

export default function ProfileSlideover({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  const deleteUser = useHandleDeleteUser();

  const handleDeleteUser = () => {
    console.log("delete user");

    deleteUser.mutate();
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-dark-900 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-dark-700 shadow-2xl">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2
                          id="slide-over-heading"
                          className="text-xl font-semibold"
                        >
                          Socials & Wallets
                        </h2>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-lg text-primary-500 border-2 p-1 border-primary-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <RxCross2 className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Main */}
                    <div>
                      <div className="mt-3 px-4 sm:px-6">
                        <p className="text-sm text-neutral-200">
                          Verify your identity so we can easily message you
                          about a giveaway or allowlist.
                        </p>

                        {/* Social accounts */}
                        <SocialSection />

                        {/* Wallets */}
                        <WalletSection />

                        <div>
                          <p className="mt-6 text-sm font-medium text-neutral-200">
                            Danger Zone
                          </p>

                          <button
                            className="mt-3 w-full px-4 py-2 rounded-lg text-red-500 border border-red-500 bg-opacity-5 hover:bg-red-500 hover:bg-opacity-10 text-sm font-medium mr-3"
                            onClick={() => setDeleteOpen(true)}
                          >
                            Delete My Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>

              <Transition appear show={isDeleteOpen} as={Fragment}>
                <Dialog
                  as="div"
                  className="relative z-10"
                  onClose={() => setDeleteOpen(false)}
                >
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                  </Transition.Child>

                  <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-primary-500">
                          <Dialog.Title className="flex justify-between">
                            <h3 className="text-lg font-medium leading-6 text-white">
                              Delete Your Account?
                            </h3>
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              onClick={() => setDeleteOpen(false)}
                            >
                              <CloseSquare size={32} />
                            </button>
                          </Dialog.Title>
                          <div className="mt-4">
                            <p className="text-sm text-white">
                              Are you sure you want to delete your account? All
                              of your allowlist and giveaway entries will be
                              permanently removed. This action cannot be undone.
                            </p>
                          </div>

                          <div className="mt-4 flex justify-between">
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              onClick={() => setDeleteOpen(false)}
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              className="inline-flex justify-center rounded-lg border border-transparent bg-red-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                              onClick={handleDeleteUser}
                            >
                              Yes, delete my account.
                            </button>
                          </div>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
