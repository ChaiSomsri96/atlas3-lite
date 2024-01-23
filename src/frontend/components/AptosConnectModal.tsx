import { shortenPublicKey } from "@/shared/utils";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { BlockchainNetwork } from "@prisma/client";
import { useWallet as useAptosWallet } from "@manahippo/aptos-wallet-adapter";
import { RxChevronDown, RxExit, RxPlusCircled } from "react-icons/rx";
import clsx from "clsx";
import { Fragment, useEffect, useState } from "react";
import { useHandleAddWallet } from "../handlers/useHandleAddWallet";
import { useUserDetails } from "../hooks/useUserDetails";
import toast from "react-hot-toast";
import { OutlineButton } from "@/styles/BaseComponents";
import { useHandleCreateNonce } from "../handlers/useHandleCreateNonce";

export const AptosConnectModal = () => {
  const aptosWallet = useAptosWallet();
  const handleAddWallet = useHandleAddWallet();
  const [isAptosModalOpen, setIsAptosModalOpen] = useState(false);
  const handleCreateNonce = useHandleCreateNonce();

  const handleClickAddWallet = async () => {
    if (!aptosWallet) {
      return toast.error("Please install Aptos wallet");
    }
    if (!aptosWallet.connected) {
      return toast.error("Please connect an Aptos wallet");
    }

    const { nonce } = await handleCreateNonce.mutateAsync({
      address: aptosWallet?.account?.address?.toString() ?? "",
    });

    const signatureMessage = `Verify wallet ownership by signing this message \n Nonce: ${nonce}`;

    const metadata = {
      address: true,
      application: true,
      chainId: true,
      message: signatureMessage,
      nonce: "12345",
    };

    const signature: string | { signature: string } =
      await aptosWallet.signMessage(metadata);

    const signed = {
      encodedMessage: (signature as { signature: string }).signature,
      message: signatureMessage,
    };

    const address = aptosWallet?.account?.address?.toString() ?? "";

    if (!address) {
      return console.log("Wallet not connected");
    }

    handleAddWallet.mutate({
      address,
      network: BlockchainNetwork.Aptos,
      message: signed.message,
      signedMessage: signed.encodedMessage,
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
    if (!aptosWallet.connected) return;
    if (!aptosWallet.account) return;
    if (!aptosWallet.account.address) return;

    const chainWallets = walletMap?.[BlockchainNetwork.Aptos];

    if (
      aptosWallet?.connected &&
      !chainWallets
        ?.map((wallet) => wallet.address)
        .includes(aptosWallet.account.address.toString())
    ) {
      handleClickAddWallet();
    }
  }, [aptosWallet?.connected]);

  return (
    <>
      {!aptosWallet?.connected && (
        <>
          {
            <OutlineButton
              onClick={() => {
                setIsAptosModalOpen(true);
              }}
            >
              <p>Connect Wallet</p>
            </OutlineButton>
          }
        </>
      )}

      {aptosWallet.connected && (
        <>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="ml-auto flex gap-2 items-center rounded-lg border border-primary-500 px-4 py-2 text-sm font-medium text-primary-500">
              {shortenPublicKey(
                aptosWallet?.account?.address?.toString() ?? ""
              )}
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
                        onClick={() => aptosWallet.disconnect()}
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
        </>
      )}
      <Transition.Root show={isAptosModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={() => {
            setIsAptosModalOpen(false);
          }}
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-neutral-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="relative inline-block align-bottom  bg-neutral-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-neutral-100 mb-8">
                  Connect an Aptos Wallet
                </h3>

                <span className="flex-grow flex flex-col mt-4">
                  {aptosWallet.connected ? (
                    <div className="text-white ">
                      <div className="text-center py-4 mb-4">
                        {shortenPublicKey(
                          aptosWallet.account?.address?.toString()
                        )}
                      </div>

                      <button
                        onClick={() => aptosWallet.disconnect()}
                        className="w-full border rounded-lg py-4 hover:bg-neutral-700"
                      >
                        Disconnect {aptosWallet.wallet?.adapter.name}
                      </button>
                    </div>
                  ) : (
                    <div className="text-white">
                      <div>
                        {aptosWallet.wallets.map((connector) => (
                          <button
                            disabled={!connector.adapter.readyState}
                            key={connector.adapter.name}
                            onClick={async () => {
                              try {
                                await aptosWallet.connect(
                                  connector.adapter.name
                                );
                              } catch (error) {
                                console.log(error);
                              }
                            }}
                            className="w-full border rounded-lg py-4 my-1 hover:bg-neutral-700"
                          >
                            {connector.adapter.name}
                            {!connector.readyState && " (unsupported)"}
                            {aptosWallet.connecting && " (connecting)"}
                          </button>
                        ))}

                        {/* <p className="text-center mt-4">
                        {error && <div>{error.message}</div>}
                      </p> */}
                      </div>
                    </div>
                  )}
                </span>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};
