import { shortenPublicKey } from "@/shared/utils";
import { Menu, Transition } from "@headlessui/react";
import { BlockchainNetwork } from "@prisma/client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { RxChevronDown, RxExit, RxPlusCircled } from "react-icons/rx";
import bs58 from "bs58";
import clsx from "clsx";
import { Fragment, useEffect } from "react";
import { useHandleAddWallet } from "../handlers/useHandleAddWallet";
import { useHandleCreateNonce } from "../handlers/useHandleCreateNonce";
import { OutlineButton } from "@/styles/BaseComponents";
import { useUserDetails } from "../hooks/useUserDetails";
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { toast } from "react-hot-toast";

export const SolanaConnectButton = () => {
  const { connecting, connected } = useWallet();
  const { publicKey, disconnect, signMessage, signTransaction } = useWallet();
  const { connection } = useConnection();
  const walletModal = useWalletModal();
  const handleCreateNonce = useHandleCreateNonce();
  const handleAddWallet = useHandleAddWallet();

  const handleClickAddWallet = async () => {
    if (!publicKey || !signMessage) {
      return console.log("Wallet not connected");
    }

    const address = publicKey?.toBase58();

    if (!address) {
      return console.log("Wallet not connected");
    }

    const { nonce } = await handleCreateNonce.mutateAsync({ address });

    const message = `Verify wallet ownership by signing this message \n Nonce: ${nonce}`;
    const messageRaw = new TextEncoder().encode(message);
    const signedMessageRaw = await signMessage(messageRaw);
    const signedMessage = bs58.encode(signedMessageRaw);

    handleAddWallet.mutate({
      address,
      network: BlockchainNetwork.Solana,
      message,
      signedMessage,
    });
  };

  const handleClickAddLedgerWallet = async () => {
    if (!publicKey || !signTransaction) {
      return console.log("Wallet not connected");
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey,
        lamports: 0.001 * LAMPORTS_PER_SOL,
      })
    );

    transaction.feePayer = publicKey;
    const blockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash.blockhash;

    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    const txRes = await connection.confirmTransaction({
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
      signature: signature,
    });

    if (txRes.value.err) {
      return toast.error(
        "Transaction failed, please make sure you have enough SOL in your wallet"
      );
    }

    const address = publicKey?.toBase58();

    if (!address) {
      return console.log("Wallet not connected");
    }

    handleAddWallet.mutate({
      address,
      network: BlockchainNetwork.Solana,
      authTx: signature,
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
    if (!publicKey) return;
    const chainWallets = walletMap?.[BlockchainNetwork.Solana];

    if (
      connected &&
      !chainWallets
        ?.map((wallet) => wallet.address)
        .includes(publicKey?.toBase58())
    ) {
      handleClickAddWallet();
    }
  }, [connected]);

  return (
    <>
      {!connected && (
        <OutlineButton onClick={() => walletModal.setVisible(true)}>
          {connecting ? <p>Connecting...</p> : <p>Connect Wallet</p>}
        </OutlineButton>
      )}

      {connected && (
        <>
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="ml-auto flex gap-2 items-center rounded-lg border border-primary-500 px-4 py-2 text-sm font-medium text-primary-500">
              {shortenPublicKey(publicKey?.toBase58())}
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
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-dark-600 shadow-lg">
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
                      >
                        <p
                          className="flex align-center"
                          onClick={handleClickAddLedgerWallet}
                        >
                          <RxPlusCircled className="mr-2 h-5 w-5" />
                          Add Ledger Wallet
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
    </>
  );
};
