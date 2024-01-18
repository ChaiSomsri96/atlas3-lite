import { GiveawayCard } from "@/frontend/components/GiveawayCard";
import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { ProjectCard } from "@/frontend/components/ProjectCard";
import { useFeaturedProjects } from "@/frontend/hooks/useFeaturedProjects";
import { useTrendyGiveaways } from "@/frontend/hooks/useTrendyGiveaways";
import { useTrendyProjects } from "@/frontend/hooks/useTrendyProjects";
import { Menu, Transition } from "@headlessui/react";
import { BlockchainNetwork } from "@prisma/client";
import Link from "next/link";
import { Fragment, useState } from "react";
import { RxChevronDown } from "react-icons/rx";
import { Carousel } from "react-responsive-carousel";

export default function Home() {
  const [network, setNetwork] = useState<BlockchainNetwork>(
    BlockchainNetwork.TBD
  );
  const [all, setAll] = useState<boolean>(true);

  const { data: projects } = useTrendyProjects(network, all);
  const { data: giveaways } = useTrendyGiveaways();

  const { data: featuredProjects } = useFeaturedProjects();

  return (
    <PublicLayout>
      <div className="w-full relative flex lg:flex-row flex-col gap-4">
        <div className="flex-1 my-24">
          <h1 className="text-white md:text-5xl text-3xl font-bold">
            Welcome to the
          </h1>
          <h2
            className="mt-2 text-primary-500 md:text-5xl text-3xl font-bold shadow-lg"
            style={{
              textShadow: "0px 0px 50px rgba(0, 133, 234, 0.5)",
            }}
          >
            home of NFTs
          </h2>

          <p className="text-lg py-6 md:w-[600px]">
            As the central hub of NFT activity, Atlas3 provides users with an
            easy way to discover new projects, participate in giveaways, submit
            wallet for allowlist allocation, receive notifications and access
            smart insights. We are the go-to destination for all things NFT.
          </p>

          <Link href={"/discover"}>
            <button
              type="button"
              className="bg-primary-500 px-6 py-3 rounded-xl font-semibold text-lg"
            >
              Explore collections
            </button>
          </Link>
        </div>

        <div
          className="relative flex-1 flex items-center justify-center bg-center"
          style={{
            backgroundImage: "url(/images/sky.svg)",
          }}
        >
          {featuredProjects && (
            <Carousel
              autoPlay
              showArrows={false}
              showIndicators={false}
              showStatus={false}
              infiniteLoop={true}
              className="md:w-[420px] w-full"
            >
              {featuredProjects.map((featuredProject, index) => (
                <div
                  key={index}
                  className="w-full"
                  style={{
                    filter: "drop-shadow(0px 0px 44px rgba(0, 133, 234, 0.3))",
                  }}
                >
                  <ProjectCard
                    project={featuredProject}
                    variant={"all"}
                    featured={true}
                  />
                </div>
              ))}
            </Carousel>
          )}
        </div>
      </div>

      <div className="relative">
        <h1 className="text-white text-lg text-center mt-20 mb-6 font-semibold">
          BUILT TO WORK FOR EVERY CHAIN
        </h1>

        <div className="flex md:flex-row flex-col gap-4 items-center justify-between">
          <img
            src="/images/logo-solana.svg"
            alt="Solana"
            className="h-6 object-fit"
          />
          <img
            src="/images/Ethereum.svg"
            alt="Ethereum"
            className="h-10 object-fit"
          />

          <div className="relative">
            <img
              src="/images/logo-polygon.svg"
              alt="Polygon"
              className="h-8 object-fit"
            />
          </div>

          <div className="relative">
            <img
              src="/images/logo-aptos.svg"
              alt="Aptos"
              className="h-8 object-fit"
            />
          </div>

          <div className="relative">
            <img
              src="/images/sui-icon.svg"
              alt="Sui"
              className="h-10 object-fit"
            />
          </div>

          <div className="relative">
            <img
              src="/images/Cardano.svg"
              alt="Cardano"
              className="h-10 object-fit"
            />
          </div>
          <div className="relative">
            <img
              src="/images/logo-bitcoin.svg"
              alt="Bitcoin"
              className="h-10 object-fit"
            />
          </div>
          <div className="relative">
            <img
              src="/images/logo-avax.svg"
              alt="Bitcoin"
              className="h-10 object-fit"
            />
          </div>
          <div className="relative">
            <img
              src="/images/logo-injective.svg"
              alt="Bitcoin"
              className="h-10 object-fit"
            />
          </div>
          <div className="relative">
            <img
              src="https://avatars.githubusercontent.com/u/104076707?s=200&v=4"
              alt="Venom"
              className="h-10 object-fit"
            />
          </div>
          <div className="relative">
            <img src="/images/logo-sei.svg" className="h-10 object-fit" />
          </div>
        </div>
      </div>

      <div className="relative my-24">
        <div className="flex md:flex-row flex-col gap-4 justify-between">
          <div className="flex md:flex-row flex-col gap-2">
            <h1 className="text-white text-3xl font-bold">
              Trending {network === BlockchainNetwork.TBD ? "" : network}{" "}
              projects on Atlas3
            </h1>
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="ml-auto flex gap-2 items-center rounded-lg px-2 text-primary-500 text-3xl font-bold">
                <RxChevronDown className="-mr-1 h-5 w-5" aria-hidden="true" />
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
                <Menu.Items className="absolute right-0 z-[101] mt-2 w-36 origin-top-right rounded-lg bg-dark-600 shadow-lg">
                  <div className="py-1 justify-start items-center w-full">
                    <Menu.Item key={-1}>
                      {({}) => (
                        <button
                          className="text-gray-100 flex justify-center px-4 py-3 text-sm rounded-lg mx-1 hover:text-primary-500"
                          onClick={() => {
                            setAll(true);
                            setNetwork(BlockchainNetwork.TBD);
                          }}
                        >
                          All
                        </button>
                      )}
                    </Menu.Item>
                    {Object.values(BlockchainNetwork)
                      .filter((x) => x !== "TBD")
                      .map((network, idx) => (
                        <Menu.Item key={idx}>
                          {({}) => (
                            <button
                              className="text-gray-100 flex justify-center px-4 py-3 text-sm rounded-lg mx-1 hover:text-primary-500"
                              onClick={() => {
                                setAll(false);
                                setNetwork(network);
                              }}
                            >
                              {network}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
          <Link href={"/discover"}>
            <button
              type="button"
              className="border border-primary-500 text-primary-500 text-center text-md font-semibold px-4 py-2 rounded-xl"
            >
              View all projects
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {projects &&
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} variant={"all"} />
            ))}
        </div>
      </div>

      <div className="relative my-24">
        <div className="flex md:flex-row flex-col gap-4 justify-between">
          <div className="flex md:flex-row flex-col gap-2">
            <h1 className="text-white text-3xl font-bold">
              Trending giveaways on Atlas3
            </h1>
          </div>
          <Link href={"/discover?tab=all_giveaways"}>
            <button
              type="button"
              className="border border-primary-500 text-primary-500 text-center text-md font-semibold px-4 py-2 rounded-xl"
            >
              View all giveaways
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {giveaways &&
            giveaways.map((giveaway) => (
              <GiveawayCard
                key={giveaway.id}
                giveaway={giveaway}
                variant="all"
              />
            ))}
        </div>
      </div>

      <div
        className="w-full mt-20 mb-32 rounded-xl"
        style={{
          background: "url(/images/bg-smyth.png)",
        }}
      >
        <div
          className="px-6 py-8 rounded-xl"
          style={{
            background:
              "linear-gradient(95.79deg, #111B2E 38.09%, rgba(22, 35, 58, 0) 90.55%)",
            filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
          }}
        >
          <h1 className="text-white md:text-5xl text-3xl font-bold mb-4">
            Explore Atlas in its full power
          </h1>
          <h2
            className="mt-2 text-primary-500 md:text-5xl text-3xl font-bold shadow-lg md:mb-12 mb-8"
            style={{
              textShadow: "0px 0px 50px rgba(0, 133, 234, 0.5)",
            }}
          >
            by holding a Smyth
          </h2>
          <button
            type="button"
            className="bg-primary-500 px-6 py-3 rounded-xl font-semibold text-lg"
          >
            Coming soon
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
