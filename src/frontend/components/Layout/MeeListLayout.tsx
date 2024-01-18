import { Header } from "./Header";
import tw from "twin.macro";
import Tippy from "@tippyjs/react";
import { useEffect, useState } from "react";
import BottomNotification from "../BottomNotification";

const MainContainer = tw.main`mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8`;
const MainInner = tw.div`mt-3 sm:mt-8`;

const FooterContainer = tw.footer`border-t-2 border-dark-700 bg-dark-900 hidden md:block mt-12`;
const FooterInner = tw.div`mx-auto max-w-[1280px] py-12 px-6 md:flex md:items-center md:justify-between lg:px-8`;

export default function MeeListLayout({
  children,
  backgroundImageSrc,
}: {
  children: React.ReactNode;
  backgroundImageSrc?: string | undefined | null;
}) {
  const [cookieAccepted, setCookieAccepted] = useState(false);
  const onCookieAccept = () => {
    console.log("Cookie accepted");
    localStorage.setItem("cookieAccepted", "true");
    setCookieAccepted(true);
  };

  useEffect(() => {
    const cookieAccepted = localStorage.getItem("cookieAccepted");
    if (cookieAccepted) {
      setCookieAccepted(true);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header variant={"default"} />

      {backgroundImageSrc ? (
        <div className="relative -z-10">
          <img
            src={backgroundImageSrc}
            alt="BannerImage"
            className="absolute w-full h-72 object-cover object-right"
          />
          <div className="absolute bg-gradient-to-t from-dark-800  to-transparent  w-full h-72" />
          <div className="absolute bg-dark-800 opacity-50  w-full h-72" />
        </div>
      ) : (
        <img
          className="fixed top-0 left-0 -z-10"
          src="/assets/top-left-ellipse.svg"
          alt=""
        />
      )}

      <div className="flex-grow flex flex-col justify-center">
        <MainContainer>
          <MainInner>{children}</MainInner>
        </MainContainer>
      </div>
      <BottomNotification />

      <Tippy
        content="Join our Discord to report any bugs or make suggestions."
        placement="left"
        theme="light-border"
        maxWidth={800}
      >
        <div className="fixed bottom-10 right-10  bg-dark-600/80 rounded-lg p-3">
          <a
            href="https://discord.gg/blocksmithlabs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="text-center text-xs text-gray-400">
              {/* <SiDiscord className="inline-block w-5 h-5" /> */}
              <img
                className="h-8 w-8"
                src="/images/Disc-Bug.svg"
                alt="BSL Logo"
              />
            </p>
          </a>
        </div>
      </Tippy>

      {!cookieAccepted && (
        <div className="fixed bottom-0 left-0 w-full bg-dark-900 text-gray-400 text-xs p-2 text-center z-50">
          This site uses cookies to improve your experience.{" "}
          <button
            className="ml-2 text-gray-400 hover:text-gray-200 underline"
            onClick={onCookieAccept}
          >
            {"Don't show again"}
          </button>
        </div>
      )}

      <FooterContainer>
        <FooterInner>
          <img className="h-8 w-auto" src="/images/logo.svg" alt="Logo" />

          <p className="text-center text-sm">
            &copy; 2023. All rights reserved.
          </p>

          <img
            className="h-8 w-auto"
            src="/images/powered-by-bsl.svg"
            alt="BSL Logo"
          />
        </FooterInner>
      </FooterContainer>
    </div>
  );
}
