import { BlockchainNetwork } from "@prisma/client";
import { Polygon, Solana } from "iconsax-react";
import { FaBitcoin, FaEthereum, FaQuestion } from "react-icons/fa";

const AptosLogo = () => (
  <svg
    className="w-4 h-4 "
    version="1.2"
    baseProfile="tiny"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 112 112"
    overflow="visible"
    xmlSpace="preserve"
  >
    <path
      fill="currentColor"
      d="M86.6 37.4h-9.9c-1.1 0-2.2-.5-3-1.3l-4-4.5c-1.2-1.3-3.1-1.4-4.5-.3l-.3.3-3.4 3.9c-1.1 1.3-2.8 2-4.5 2H2.9C1.4 41.9.4 46.6 0 51.3h51.2c.9 0 1.8-.4 2.4-1l4.8-5c.6-.6 1.4-1 2.3-1h.2c.9 0 1.8.4 2.4 1.1l4 4.5c.8.9 1.9 1.4 3 1.4H112c-.4-4.7-1.4-9.4-2.9-13.8H86.6zM53.8 65l-4-4.5c-1.2-1.3-3.1-1.4-4.5-.3l-.3.3-3.5 3.9c-1.1 1.3-2.7 2-4.4 2H.8c.9 4.8 2.5 9.5 4.6 14h25.5c.9 0 1.7-.4 2.4-1l4.8-5c.6-.6 1.4-1 2.3-1h.2c.9 0 1.8.4 2.4 1.1l4 4.5c.8.9 1.9 1.4 3 1.4h56.6c2.1-4.4 3.7-9.1 4.6-14H56.8c-1.2 0-2.3-.5-3-1.4zm19.6-43.6 4.8-5c.6-.6 1.4-1 2.3-1h.2c.9 0 1.8.4 2.4 1l4 4.5c.8.9 1.9 1.3 3 1.3h10.8c-18.8-24.8-54.1-29.7-79-11-4.1 3.1-7.8 6.8-11 11H71c1 .2 1.8-.2 2.4-.8zM34.7 94.2c-1.2 0-2.3-.5-3-1.3l-4-4.5c-1.2-1.3-3.2-1.4-4.5-.2l-.2.2-3.5 3.9c-1.1 1.3-2.7 2-4.4 2h-.2C36 116.9 71.7 118 94.4 96.7c.9-.8 1.7-1.7 2.6-2.6H34.7z"
    ></path>
  </svg>
);

const AvaxLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    data-name="Layer 1"
    viewBox="0 0 128 128"
    id="avax"
    className="w-4 h-4 "
  >
    <path
      d="M45 104.68H20a5.3 5.3 0 0 1-4.62-7.9l44.08-78.19a5.3 5.3 0 0 1 9.23 0L81.9 41.91a5.3 5.3 0 0 1 0 5.31l-32.31 54.85a5.29 5.29 0 0 1-4.59 2.61zm28.48-7.92 14.85-26.49a5.31 5.31 0 0 1 9.24 0l15 26.48a5.31 5.31 0 0 1-4.61 7.93H78.11a5.31 5.31 0 0 1-4.63-7.92z"
      fill="currentColor"
    ></path>
  </svg>
);

const SuiLogo = () => (
  <img src="/images/sui-icon.svg" className="w-4 h-4"></img>
);

const CardanoLogo = () => (
  <img src="/images/cardano-icon.png" className="w-4 h-4"></img>
);

export const NetworkIcon = {
  [BlockchainNetwork.Ethereum]: <FaEthereum className="w-4 h-4" />,
  [BlockchainNetwork.Polygon]: (
    <Polygon variant={"Linear"} className="w-4 h-4" />
  ),
  [BlockchainNetwork.Solana]: <Solana variant={"Bold"} className="w-4 h-4" />,
  [BlockchainNetwork.Aptos]: <AptosLogo />,
  [BlockchainNetwork.Sui]: <SuiLogo />,
  [BlockchainNetwork.Cardano]: <CardanoLogo />,
  [BlockchainNetwork.Bitcoin]: <FaBitcoin className="w-4 h-4" />,
  [BlockchainNetwork.TBD]: <FaQuestion className="w-4 h-4" />,

  [BlockchainNetwork.Avax]: <AvaxLogo />,
  [BlockchainNetwork.Venom]: (
    <img
      src="https://avatars.githubusercontent.com/u/104076707?s=200&v=4"
      className="h-4 w-4"
    />
  ),
  [BlockchainNetwork.Injective]: (
    <img
      src="https://cryptologos.cc/logos/injective-inj-logo.png?v=025"
      className="h-4 w-4"
    />
  ),
  [BlockchainNetwork.Sei]: (
    <img
      src="https://s2.coinmarketcap.com/static/img/coins/64x64/23149.png"
      className="h-4 w-4"
    />
  ),
};
