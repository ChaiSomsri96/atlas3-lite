import { useProfileSlideoverProvider } from "@/frontend/contexts/ProfileSlideoverProvider";
import { OAuthProviders } from "@/shared/types";
import { Menu, Transition } from "@headlessui/react";
import { UserType } from "@prisma/client";
import clsx from "clsx";
import { ArrowDown2 } from "iconsax-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Fragment, useState } from "react";
import { HiMenu } from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";
import { RxChevronDown } from "react-icons/rx";
import { SiDiscord, SiTwitter } from "react-icons/si";
import CreatorSidebar from "../CreatorSidebar";
import { SearchCollection } from "./SearchCollection";
import { useRouter } from "next/router";
import { useStats } from "@/frontend/hooks/useStats";

export const Header = ({ variant }: { variant?: "default" | "creator" }) => {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";
  const { setOpen: setProfileOpen } = useProfileSlideoverProvider();
  const [isShowMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const { route } = useRouter();
  const { data } = useStats();

  const isCreator = session?.user?.type === UserType.CREATOR;
  const isAdmin =
    session?.user?.type === UserType.ADMIN ||
    session?.user?.type === UserType.MASTER;

  const navigation = [
    { name: "Dashboard", href: "/dashboard", creatorOnly: true },
    {
      name: "Discover",
      href: "/discover",
      creatorOnly: true,
    },
    {
      name: (
        <div className="flex items-center gap-2">
          <span>Raffles</span>
          <span className="">
            <div className="px-2 text-sm bg-primary-500 rounded-lg text-white">
              {data?.stats?.runningRaffles}
            </div>
          </span>
        </div>
      ),
      href: "/raffles",
      creatorOnly: true,
    },
    {
      name: (
        <div className="flex items-center gap-2">
          <span>Lottery</span>
          <span className="">
            <img src="/images/jackpot.svg" className="relative w-4 h-4" />
          </span>
        </div>
      ),
      href: "/lottery",
      creatorOnly: true,
    },
    {
      name: (
        <div className="flex items-center gap-2">
          <span>Applications</span>
          <span className="">
            <div className="px-2 text-sm bg-primary-500 rounded-lg text-white">
              {data?.stats?.runningApplications}
            </div>
          </span>
        </div>
      ),
      href: "/applications",
      creatorOnly: true,
    },

    {
      name: "Marketplace",
      href: "/marketplace",
      creatorOnly: true,
    },
    {
      name: "Rankings",
      href: "/rankings",
      creatorOnly: true,
    },
    { name: "Creator", href: "/creator", creatorOnly: true },
    { name: "Admin", href: "/admin", adminOnly: true },
  ];

  return (
    <header className="bg-dark-900 z-10">
      <nav
        className={`px-6 lg:px-8 mx-auto 
        ${variant === "default" ? "max-w-7xl" : ""}
      `}
      >
        <div className="flex w-full items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Link href={"/"}>
              <span className="sr-only">Atlas3</span>
              <img className="h-10 w-auto" src="/images/logo.svg" alt="Logo" />
            </Link>
            <div className="lg:block hidden">
              <SearchCollection />
            </div>
          </div>

          {sessionLoading ? (
            <div className="h-10 w-28 bg-dark-400 animate-pulse rounded-lg" />
          ) : session ? (
            <div className="flex gap-2">
              <button
                className="flex gap-2 items-center rounded-lg border border-primary-500 sm:px-4 px-2 py-2 text-sm font-medium"
                onClick={() => setProfileOpen(true)}
              >
                {session.user.image && (
                  <img
                    className="h-6 w-6 rounded-lg"
                    src={session.user.image}
                    alt=""
                  />
                )}
                <span className="sm:block hidden">{session.user.name}</span>
                <ArrowDown2 size={24} className="sm:hidden block" />
              </button>
              <button
                type="button"
                className="lg:hidden block border border-primary-500 p-2 rounded-md text-white"
                onClick={() => setShowMobileMenu(!isShowMobileMenu)}
              >
                {isShowMobileMenu ? (
                  <HiXMark size={20} />
                ) : (
                  <HiMenu size={20} />
                )}
              </button>
            </div>
          ) : (
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-2 text-sm font-medium">
                  Sign In
                  <RxChevronDown
                    className="-mr-1 ml-2 h-5 w-5"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-52 origin-top-right rounded-lg bg-dark-600 shadow-lg">
                  <div className="flex flex-col py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signIn(OAuthProviders.DISCORD)}
                          className={clsx(
                            active
                              ? "bg-dark-500 text-gray-100"
                              : "text-gray-200",
                            "flex justify-center px-4 py-3 text-sm rounded-lg mx-1"
                          )}
                        >
                          <p className="flex align-center">
                            <SiDiscord className="mr-2 h-5 w-5" />
                            Sign in with Discord
                          </p>
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => signIn(OAuthProviders.TWITTER)}
                          className={clsx(
                            active
                              ? "bg-dark-500 text-gray-100"
                              : "text-gray-200",
                            "flex justify-center px-4 py-3 text-sm rounded-lg mx-1"
                          )}
                        >
                          <p className="flex align-center">
                            <SiTwitter className="mr-2 h-5 w-5 " />
                            Sign in with Twitter
                          </p>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>

        <div className="hidden md:block">
          <div className="mb-4 border-b border-gray-800 flex">
            {navigation.map((link) => {
              if (link.creatorOnly && !(isCreator || isAdmin)) {
                return null;
              }

              if (link.adminOnly && !isAdmin) {
                return null;
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  // className="text-base font-medium hover:bg-dark-600 rounded-lg px-1 py-2 text-gray-200"
                  className={`text-base font-medium px-4 py-2 hover:text-primary-500 hover:border-b-2 border-primary-500
                   ${route == link.href ? "border-b-2" : ""}
                   ${route == link.href ? "text-primary-500" : "text-gray-400"}
                   `}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
          show={isShowMobileMenu}
        >
          <div className="w-full lg:hidden flex flex-col gap-4 pb-4 border-b border-gray-500">
            <SearchCollection />
            <div className="flex-col justify-center gap-4 flex md:hidden">
              {navigation.map((link) => {
                if (link.creatorOnly && !isCreator && !isAdmin) {
                  return null;
                }

                if (link.adminOnly && !isAdmin) {
                  return null;
                }
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setShowMobileMenu(false)}
                    className="text-base font-medium text-white hover:text-indigo-50"
                  >
                    {link.name}
                  </a>
                );
              })}
            </div>
            {variant === "creator" ? (
              <div className="">
                <CreatorSidebar />
              </div>
            ) : null}
          </div>
        </Transition>
      </nav>
    </header>
  );
};
