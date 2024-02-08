import { shortenPublicKey } from "@/shared/utils";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { BlockchainNetwork } from "@prisma/client";
import { RxChevronDown, RxExit, RxPlusCircled } from "react-icons/rx";
import clsx from "clsx";
import { Fragment, useEffect, useState } from "react";
import { useHandleAddWallet } from "../handlers/useHandleAddWallet";
import { useHandleCreateNonce } from "../handlers/useHandleCreateNonce";
import { OutlineButton } from "@/styles/BaseComponents";
import { useUserDetails } from "../hooks/useUserDetails";
import {
  NetworkType,
  useCardano,
} from "@cardano-foundation/cardano-connect-with-wallet";
import { toast } from "react-hot-toast";

interface CardanoWindow extends Window {
  cardano: object;
}

declare let window: CardanoWindow;

interface CardanoWallet {
  name: string;
  title: string;
  link: string;
}

const supportedWallets: CardanoWallet[] = [
  {
    title: "Yoroi",
    name: "yoroi",
    link: "https://yoroi-wallet.com/",
  },
  {
    title: "Nami",
    name: "nami",
    link: "https://namiwallet.io/",
  },
  {
    title: "Flint",
    name: "flint",
    link: "https://flint-wallet.com/",
  },
  {
    title: "Typhon",
    name: "typhon",
    link: "https://typhonwallet.io/",
  },
  {
    title: "GeroWallet",
    name: "gerowallet",
    link: "https://gerowallet.io/",
  },
  {
    title: "Eternl",
    name: "eternl",
    link: "https://eternl.io/",
  },
];

const CardanoNoHookButton = () => {
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async (wallet: CardanoWallet) => {
    window.open(wallet.link, "_blank");
  };

  return (
    <>
      <OutlineButton onClick={() => setShowModal(true)}>
        <p>Connect Wallet</p>
      </OutlineButton>

      <Transition.Root show={showModal} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={() => {
            setShowModal(false);
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
                  Connect an Cardano Wallet
                </h3>

                <span className="flex-grow flex flex-col mt-4">
                  <div className="text-white">
                    <div>
                      {supportedWallets.map((wallet) => (
                        <button
                          key={`wallet-${wallet.name}`}
                          onClick={() => handleConnect(wallet)}
                          className="w-full border rounded-lg py-4 my-1 hover:bg-neutral-700"
                        >
                          {wallet.title}
                        </button>
                      ))}

                      {/* <p className="text-center mt-4">
                        {error && <div>{error.message}</div>}
                      </p> */}
                    </div>
                  </div>
                </span>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

const CardanoHookButton = () => {
  const {
    isConnected,
    signMessage,
    isConnecting,
    connect,
    disconnect,
    stakeAddress: address,
  } = useCardano({
    limitNetwork: NetworkType.MAINNET,
  });

  const [showModal, setShowModal] = useState(false);
  const handleCreateNonce = useHandleCreateNonce();
  const handleAddWallet = useHandleAddWallet();

  const handleClickAddWallet = async () => {
    if (!signMessage) {
      return console.log("Wallet not connected");
    }

    if (!address) {
      return console.log("Wallet not connected");
    }

    const { nonce } = await handleCreateNonce.mutateAsync({ address });

    const message = `Verify wallet ownership by signing this message \n Nonce: ${nonce}`;
    signMessage(
      message,
      (signedMessage) => {
        console.log(signMessage);

        handleAddWallet.mutate({
          address,
          network: BlockchainNetwork.Cardano,
          message,
          signedMessage,
        });
      },
      (err) => {
        console.log(err);
      }
    );
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
    if (!address) return;
    console.log(address);
    const chainWallets = walletMap?.[BlockchainNetwork.Cardano];

    if (
      isConnected &&
      !chainWallets?.map((wallet) => wallet.address).includes(address)
    ) {
      handleClickAddWallet();
    }
  }, [address]);

  const handleConnect = async (wallet: CardanoWallet) => {
    const keys = Object.keys(window.cardano);
    console.log(keys, wallet.name, keys.indexOf(wallet.name));
    if (keys.indexOf(wallet.name) >= 0) {
      connect(
        wallet.name,
        () => {
          setShowModal(false);
        },
        (errCode) => {
          console.log(`Connect error with ${errCode}`);
          toast.error(`Get error while connect wallet.`);
        }
      );
    } else {
      window.open(wallet.link, "_blank");
    }
  };

  return (
    <>
      {!isConnected && (
        <OutlineButton onClick={() => setShowModal(true)}>
          {isConnecting ? <p>Connecting...</p> : <p>Connect Wallet</p>}
        </OutlineButton>
      )}

      {isConnected && (
        <>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="ml-auto flex gap-2 items-center rounded-lg border border-primary-500 px-4 py-2 text-sm font-medium text-primary-500">
              {shortenPublicKey(address ?? "")}
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
                          onClick={() => setShowModal(true)}
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
                        onClick={() => disconnect()}
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

      <Transition.Root show={showModal} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={() => {
            setShowModal(false);
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
                  Connect an Cardano Wallet
                </h3>

                <span className="flex-grow flex flex-col mt-4">
                  <div className="text-white">
                    <div>
                      {supportedWallets.map((wallet) => (
                        <button
                          key={`wallet-${wallet.name}`}
                          onClick={() => handleConnect(wallet)}
                          className="w-full border rounded-lg py-4 my-1 hover:bg-neutral-700"
                        >
                          {wallet.title}
                        </button>
                      ))}

                      {/* <p className="text-center mt-4">
                        {error && <div>{error.message}</div>}
                      </p> */}
                    </div>
                  </div>
                </span>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export const CardanoConnectButton = () => {
  const [isCardanoInstalled, setCardanoInstalled] = useState(false);

  useEffect(() => {
    if (window.cardano) {
      setCardanoInstalled(true);
    } else {
      setCardanoInstalled(false);
    }
  }, []);

  return (
    <>{isCardanoInstalled ? <CardanoHookButton /> : <CardanoNoHookButton />}</>
  );
};
