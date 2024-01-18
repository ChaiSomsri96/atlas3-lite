import "@/styles/globals.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import Router from "next/router";

import type { AppProps } from "next/app";
import {
  DehydratedState,
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { SolanaWalletProvider } from "@/frontend/contexts/SolanaWalletProvider";
import { EthereumWalletProvider } from "@/frontend/contexts/EthereumWalletProvider";
import { Toaster } from "react-hot-toast";
import { useState } from "react";
import { ProfileSlideoverProvider } from "@/frontend/contexts/ProfileSlideoverProvider";
import Head from "next/head";
import nProgress from "nprogress";

import "@fontsource/poppins/200.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "nprogress/nprogress.css";

import {
  WalletProvider as AptosWalletProvider,
  HippoWalletAdapter,
  AptosWalletAdapter,
  HippoExtensionWalletAdapter,
  MartianWalletAdapter,
  FewchaWalletAdapter,
  PontemWalletAdapter,
  SpikaWalletAdapter,
  RiseWalletAdapter,
  FletchWalletAdapter,
  TokenPocketWalletAdapter,
  ONTOWalletAdapter,
} from "@manahippo/aptos-wallet-adapter";
import { SuiWalletProvider } from "@/frontend/contexts/SuiWalletProvider";
import { GoogleAnalytics } from "nextjs-google-analytics";

const aptosWallets = [
  new MartianWalletAdapter(),
  new RiseWalletAdapter(),
  new AptosWalletAdapter(),
  new HippoWalletAdapter(),
  new FewchaWalletAdapter(),
  new HippoExtensionWalletAdapter(),
  new PontemWalletAdapter(),
  new SpikaWalletAdapter(),
  new FletchWalletAdapter(),
  new TokenPocketWalletAdapter(),
  new ONTOWalletAdapter(),
];

nProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 800,
  showSpinner: false,
});

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

export default function App({
  Component,
  pageProps: { session, dehydratedState, ...pageProps },
}: AppProps<{ session: Session; dehydratedState: DehydratedState }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Atlas3 | Powered by BlocksmithLabs</title>
        <meta
          content="https://uploads-ssl.webflow.com/6385e4f439e0d6817a7023ac/63e24174115cee16c4bc6114_opengraph.jpg"
          property="og:image"
        />
        <meta
          name="description"
          content="The only place you need for everything NFTs. It's where you can find out everything about pre-mint and post-mint projects."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <Hydrate state={dehydratedState}>
          <SessionProvider session={session}>
            <AptosWalletProvider
              wallets={aptosWallets}
              autoConnect={true} /** allow auto wallet connection or not **/
              onError={(error: Error) => {
                console.log("Handle Error Message", error);
              }}
            >
              <SolanaWalletProvider>
                <EthereumWalletProvider>
                  <SuiWalletProvider>
                    <ProfileSlideoverProvider>
                      <>
                        <GoogleAnalytics trackPageViews />
                        <Component {...pageProps} />
                        <Toaster position={"bottom-right"} />
                      </>
                    </ProfileSlideoverProvider>
                  </SuiWalletProvider>
                </EthereumWalletProvider>
              </SolanaWalletProvider>
            </AptosWalletProvider>
          </SessionProvider>
        </Hydrate>
      </QueryClientProvider>
    </>
  );
}
