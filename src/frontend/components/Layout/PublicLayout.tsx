import { Header } from "./Header";
import tw from "twin.macro";
import Tippy from "@tippyjs/react";
import { useEffect, useState } from "react";
import { CloseIcon } from "../Lotto/SvgIcons";
import { useRouter } from "next/router";

const MainContainer = tw.main`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`;
const MainInner = tw.div`mt-3 sm:mt-8`;

const FooterContainer = tw.footer`border-t-2 border-dark-700 bg-dark-900 hidden md:block mt-12`;
const FooterInner = tw.div`mx-auto max-w-7xl py-12 px-6 md:flex md:items-center md:justify-between lg:px-8`;

export default function PublicLayout({
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

  const [showSponsorBanner, setShowSponsorBanner] = useState(true);
  const router = useRouter(); // Use the useRouter hook

  const hideSponsorBanner = () => {
    const now = new Date().getTime();
    localStorage.setItem("sponsorBannerHiddenAt", now.toString());
    setShowSponsorBanner(false);
  };

  useEffect(() => {
    const sponsorBannerHiddenAt = localStorage.getItem("sponsorBannerHiddenAt");
    if (sponsorBannerHiddenAt) {
      const now = new Date().getTime();
      const daysSinceHidden =
        (now - Number(sponsorBannerHiddenAt)) / (1000 * 60 * 60 * 24);

      if (daysSinceHidden < 7) {
        setShowSponsorBanner(false);
      } else {
        // Remove the timestamp from local storage after 7 days to show the banner again
        localStorage.removeItem("sponsorBannerHiddenAt");
        setShowSponsorBanner(true);
      }
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

      <div className="flex-grow">
        <MainContainer>
          <MainInner>{children}</MainInner>
        </MainContainer>
      </div>
      {/*<BottomNotification />*/}

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

      {
        // Only show the sponsor banner on the /lotto page and if showSponsorBanner is true
        router.pathname === "/lottery" && showSponsorBanner && (
          <div className="fixed bottom-10 left-10 rounded-lg hidden md:block w-1/5">
            <div
              className="rounded-2xl border border-primary-800 p-4 flex flex-col bg-primary-900 overflow-hidden relative group"
              style={{
                boxShadow:
                  "0px -1px 10px 3px rgba(70, 130, 240, 0.10), 0px -0.5px 3px 1px rgba(30, 100, 220, 0.15)",
              }}
            >
              <div className="flex justify-between items-center ml-2 text-xl font-bold text-white relative z-10">
                Want to become a sponsor?
                <span
                  className="mr-2 cursor-pointer"
                  onClick={() => {
                    hideSponsorBanner();
                  }}
                >
                  <CloseIcon />
                </span>
              </div>
              <div className="ml-2 text-sm mt-2 text-white text-neutral-200 relative z-10">
                We are always looking for sponsors for the lottery, if you want
                to sponsor some prizes, please raise a ticket in{" "}
                <a
                  href="https://discord.gg/blocksmithlabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 underline hover:text-primary-400 inline"
                >
                  our Discord.
                </a>
              </div>
            </div>
          </div>
        )
      }

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
