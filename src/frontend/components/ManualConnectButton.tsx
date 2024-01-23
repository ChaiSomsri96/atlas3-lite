import { Dialog, Transition } from "@headlessui/react";
import { BlockchainNetwork } from "@prisma/client";
import { Fragment, useState } from "react";
import { OutlineButton } from "@/styles/BaseComponents";
import { useHandleAddManualWallet } from "../handlers/useHandleAddManualWallet";

export const ManualConnectButton = ({
  network,
}: {
  network: BlockchainNetwork;
}) => {
  const [showModal, setShowModal] = useState(false);
  const handleAddWallet = useHandleAddManualWallet();
  const [address, setAddress] = useState<string>();

  const handleClickAddWallet = async () => {
    if (!address) {
      return;
    }

    setShowModal(false);

    handleAddWallet.mutate({
      address,
      network,
    });
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
                  Add a {network} Wallet
                </h3>

                <div className="my-4">
                  <input
                    type="text"
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Input your wallet address"
                    className="bg-white w-full form-input rounded-lg text-black"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleClickAddWallet}
                  className="w-full border rounded-lg py-4 my-1 hover:bg-neutral-700"
                >
                  Submit
                </button>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};
