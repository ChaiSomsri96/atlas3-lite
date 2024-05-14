import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { MyVotesLeaderboard } from "@/frontend/components/Leaderboard/MyVotesLeaderboard";
import { PostMintLeaderboard } from "@/frontend/components/Leaderboard/PostMintLeaderboard";
import { PreMintLeaderboard } from "@/frontend/components/Leaderboard/PreMintLeaderboard";
import { Tab } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { HiSearch } from "react-icons/hi";

export default function Rankings() {
  const [search, setSearch] = useState<string>("");

  const searchRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (evt: Event) => {
    if (searchRef.current && !searchRef.current.contains(evt.target as Node)) {
      // Show project search menu
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <PublicLayout>
      <div>
        <h1 className="text-white md:text-3xl text-2xl py-4 font-bold text-center">
          Projects Leaderboard
        </h1>
        <div>
          <Tab.Group>
            <div>
              <div className="flex md:flex-row flex-col gap-4 justify-between items-center">
                <Tab.List className="bg-dark-600 flex justify-between rounded-lg p-1 w-fit">
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`${
                          selected && "bg-primary-500"
                        }  py-2 px-3 rounded-lg text-sm xs:w-40`}
                      >
                        Pre-Mint Projects
                      </button>
                    )}
                  </Tab>
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`${
                          selected && "bg-primary-500"
                        }  py-2 px-3 rounded-lg text-sm xs:w-40`}
                      >
                        Post-Mint Projects
                      </button>
                    )}
                  </Tab>
                  <Tab as={Fragment}>
                    {({ selected }) => (
                      <button
                        className={`${
                          selected && "bg-primary-500"
                        }  py-2 px-3 rounded-lg text-sm xs:w-40`}
                      >
                        My Votes
                      </button>
                    )}
                  </Tab>
                </Tab.List>
                <div className="bg-gray-800 px-4 py-2 rounded-xl flex gap-2 items-center md:w-fit w-full">
                  <HiSearch size={24} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search project"
                    className="w-full border-none text-md bg-transparent focus:outline-none hover:outline-none ring-none"
                  />
                </div>
              </div>
            </div>

            <Tab.Panels>
              <Tab.Panel className="mt-3">
                <PreMintLeaderboard search={search} />
              </Tab.Panel>
              <Tab.Panel className="mt-3">
                <PostMintLeaderboard search={search} />
              </Tab.Panel>
              <Tab.Panel className="mt-3">
                <MyVotesLeaderboard />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </PublicLayout>
  );
}
