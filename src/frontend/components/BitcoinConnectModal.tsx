import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
// import toast from "react-hot-toast";
import { OutlineButton } from "@/styles/BaseComponents";
import { AddressPurposes, getAddress, GetAddressResponse } from "sats-connect";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";
import { useHandleAddWallet } from "../handlers/useHandleAddWallet";
import { BlockchainNetwork } from "@prisma/client";
import { toast } from "react-hot-toast";
import { useHandleCreateNonce } from "../handlers/useHandleCreateNonce";

const appConfig = new AppConfig(["store_write", "publish_data"]);
export const userSession = new UserSession({ appConfig });

const BitcoinWallets = {
  Xverse: "Xverse",
  Hiro: "Hiro",
  Unisat: "Unisat",
};

type BitcoinWallet = keyof typeof BitcoinWallets;

interface BitcoinWindow extends Window {
  unisat: object | undefined;
}

declare let window: BitcoinWindow;

export const BitcoinConnectModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleAddWallet = useHandleAddWallet();
  const handleCreateNonce = useHandleCreateNonce();

  const connectXverseWallet = () => {
    const getAddressOptions = {
      payload: {
        purposes: [AddressPurposes.PAYMENT, AddressPurposes.ORDINALS],
        message: "Address for receiving Ordinals",
        network: {
          type: "Mainnet",
          address: "",
        },
      },
      onFinish: async (response: GetAddressResponse) => {
        const ordinalAddress = response.addresses.find(
          (address) => address.purpose === AddressPurposes.ORDINALS
        );

        const paymentAddress = response.addresses.find(
          (address) => address.purpose === AddressPurposes.PAYMENT
        );

        const ordinalAddressToAdd = ordinalAddress?.address;
        const paymentAddressToAdd = paymentAddress?.address;

        console.log("Adding Xverse address", ordinalAddressToAdd);

        if (!ordinalAddressToAdd || !paymentAddressToAdd) {
          return toast.error("Could not get address from Xverse wallet");
        }

        const { nonce: nonceOrdinal } = await handleCreateNonce.mutateAsync({
          address: ordinalAddressToAdd,
        });

        handleAddWallet.mutate({
          address: ordinalAddressToAdd,
          network: BlockchainNetwork.Bitcoin,
          message: `Verify wallet ownership by signing this message \n Nonce: ${nonceOrdinal}`,
          signedMessage: Buffer.from("message").toString("base64"),
        });

        const { nonce: noncePayment } = await handleCreateNonce.mutateAsync({
          address: paymentAddressToAdd,
        });

        handleAddWallet.mutate({
          address: paymentAddressToAdd,
          network: BlockchainNetwork.Bitcoin,
          message: `Verify wallet ownership by signing this message \n Nonce: ${noncePayment}`,
          signedMessage: Buffer.from("message").toString("base64"),
        });
      },
      onCancel: () => alert("Request canceled"),
    };

    getAddress(getAddressOptions);
  };

  const connectUnisatWallet = async () => {
    if (typeof window.unisat === "undefined") {
      console.log("Unisat Wallet is not installed!");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unisat = window.unisat as unknown as any;

    const accounts = await unisat.requestAccounts();

    const addressToAdd = accounts[0];

    console.log("Adding Unisat address", addressToAdd);

    if (!addressToAdd) {
      return toast.error("Could not get address from Xverse wallet");
    }

    const { nonce } = await handleCreateNonce.mutateAsync({
      address: addressToAdd,
    });

    handleAddWallet.mutate({
      address: addressToAdd,
      network: BlockchainNetwork.Bitcoin,
      message: `Verify wallet ownership by signing this message \n Nonce: ${nonce}`,
      signedMessage: Buffer.from("message").toString("base64"),
    });
  };

  const connnectHiroWallet = () => {
    showConnect({
      userSession, // `userSession` from previous step, to access storage
      appDetails: {
        name: "Atlas3",
        icon: "https://atlas3.io/favicon.ico",
      },
      onFinish: async () => {
        const userData = userSession.loadUserData();

        console.log("Adding Hiro wallet", userData.profile);

        const ordinalAddressToAdd = userData.profile.btcAddress.p2tr.mainnet;
        const paymentAddressToAdd = userData.profile.btcAddress.p2wpkh.mainnet;

        if (!ordinalAddressToAdd || !paymentAddressToAdd) {
          return toast.error("Could not get address from Xverse wallet");
        }

        const { nonce: ordinalNonce } = await handleCreateNonce.mutateAsync({
          address: paymentAddressToAdd,
        });

        handleAddWallet.mutate({
          address: ordinalAddressToAdd,
          network: BlockchainNetwork.Bitcoin,
          message: `Verify wallet ownership by signing this message \n Nonce: ${ordinalNonce}`,
          signedMessage: Buffer.from("message").toString("base64"),
        });

        const { nonce: paymentNonce } = await handleCreateNonce.mutateAsync({
          address: paymentAddressToAdd,
        });

        handleAddWallet.mutate({
          address: paymentAddressToAdd,
          network: BlockchainNetwork.Bitcoin,
          message: `Verify wallet ownership by signing this message \n Nonce: ${paymentNonce}`,
          signedMessage: Buffer.from("message").toString("base64"),
        });
      },
      onCancel: () => {
        console.log("oops"); // WHEN user cancels/closes pop-up
      },
    });
  };

  const handleClickWallet = (wallet: BitcoinWallet) => {
    console.log("wallet", wallet);

    switch (wallet) {
      case BitcoinWallets.Xverse:
        connectXverseWallet();
        break;
      case BitcoinWallets.Hiro:
        connnectHiroWallet();
        break;
      case BitcoinWallets.Unisat:
        connectUnisatWallet();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <OutlineButton
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <p>Connect Wallet</p>
      </OutlineButton>

      <Transition.Root show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed z-10 inset-0 overflow-y-auto"
          onClose={() => {
            setIsModalOpen(false);
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
                  Connect a Bitcoin Wallet
                </h3>

                <span className="flex-grow flex flex-col mt-4">
                  <div className="text-white">
                    <div>
                      {Object.keys(BitcoinWallets).map((wallet) => (
                        <button
                          key={wallet}
                          onClick={() => {
                            handleClickWallet(wallet as BitcoinWallet);
                          }}
                          className="w-full border rounded-lg py-4 my-1 hover:bg-neutral-700"
                        >
                          {wallet}
                        </button>
                      ))}
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
