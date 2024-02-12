import { Menu, Transition } from "@headlessui/react";
import { BlockchainNetwork } from "@prisma/client";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { RxChevronDown, RxExit, RxPlusCircled } from "react-icons/rx";

import clsx from "clsx";
import { Fragment, useEffect } from "react";
import { useAccount, useDisconnect, useNetwork, useSignMessage } from "wagmi";
import { useHandleAddWallet } from "../handlers/useHandleAddWallet";
import { useHandleCreateNonce } from "../handlers/useHandleCreateNonce";
import { OutlineButton } from "@/styles/BaseComponents";
import { useUserDetails } from "../hooks/useUserDetails";

const EvmNetworks = {
  Ethereum: BlockchainNetwork.Ethereum,
  Polygon: BlockchainNetwork.Polygon,
};

type EvmNetwork = (typeof EvmNetworks)[keyof typeof EvmNetworks];

export const EthereumConnectButton = ({ network }: { network: EvmNetwork }) => {
  const ethDisconnect = useDisconnect();
  const ethSignMessage = useSignMessage();
  const ethAccount = useAccount();
  const handleCreateNonce = useHandleCreateNonce();
  const handleAddWallet = useHandleAddWallet();
  const { chain } = useNetwork();

  const handleClickAddWallet = async () => {
    const address = ethAccount?.address;

    if (!address) {
      return console.log("Wallet not connected");
    }

    const { nonce } = await handleCreateNonce.mutateAsync({ address });

    const message = `Verify wallet ownership by signing this message \n Nonce: ${nonce}`;
    const signedMessage = await ethSignMessage.signMessageAsync({ message });

    handleAddWallet.mutate({
      address,
      network,
      message,
      signedMessage,
    });
  };

  const { data: userDetails } = useUserDetails();

  const walletMap = userDetails?.wallets?.reduce((acc, wallet) => {
    if (!acc[wallet.network]) {
      acc[wallet.network] = [];
    }

    acc[wallet.network].push(wallet);

    return acc;
  }, {} as Record<BlockchainNetwork, typeof userDetails.wallets>);

  useEffect(() => {
    if (!ethAccount.address) return;
    const chainWallets = walletMap?.[network];

    if (
      ethAccount.isConnected &&
      !chainWallets
        ?.map((wallet) => wallet.address)
        .includes(ethAccount.address) &&
      chain?.name === network
    ) {
      handleClickAddWallet();
    }
  }, [ethAccount.isConnected]);

  return (
    <>
      <ConnectButton.Custom>
        {({ account, chain, openChainModal, openConnectModal, mounted }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <OutlineButton onClick={openConnectModal}>
                      Connect Wallet
                    </OutlineButton>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      className="ml-auto flex gap-2 items-center rounded-lg border border-primary-500 px-4 py-2 text-sm font-medium text-primary-500"
                    >
                      Wrong network
                    </button>
                  );
                }

                return (
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="ml-auto flex gap-2 items-center rounded-lg border border-primary-500 px-4 py-2 text-sm font-medium text-primary-500">
                      {account.displayName}
                      <RxChevronDown
                        className="-mr-1 ml-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-lg bg-dark-600 shadow-lg">
                        <div className="py-1 justify-start items-center w-full">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={clsx(
                                  active
                                    ? "bg-dark-500 text-gray-100"
                                    : "text-gray-200",
                                  "flex justify-center px-4 py-3 text-sm rounded-lg mx-1"
                                )}
                              >
                                <p
                                  className="flex align-center"
                                  onClick={handleClickAddWallet}
                                >
                                  <RxPlusCircled className="mr-2 h-5 w-5" />
                                  Add Wallet
                                </p>
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                className={clsx(
                                  active
                                    ? "bg-dark-500 text-gray-100"
                                    : "text-gray-200",
                                  "flex justify-center px-4 py-3 text-sm rounded-lg mx-1"
                                )}
                                onClick={() => ethDisconnect.disconnect()}
                              >
                                <p className="flex align-center text-red-500">
                                  <RxExit className="mr-2 h-5 w-5" />
                                  Disconnect
                                </p>
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </>
  );
};
