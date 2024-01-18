import { useAllCollections } from "@/frontend/hooks/useAllCollections";
import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { NetworkIcon } from "@/shared/getNetworkIcon";

export const SearchCollection = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [collectionsShow, setCollectionsShow] = useState<boolean>(false);

  const { data: collections } = useAllCollections({
    search,
    collectionsShow,
  });

  const searchRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (evt: Event) => {
    if (searchRef.current && !searchRef.current.contains(evt.target as Node)) {
      setCollectionsShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);
    return () => clearTimeout(searchTimer);
  }, [searchInput]);

  return (
    <div>
      <Menu as="div" className="relative" ref={searchRef}>
        <div className="bg-gray-800 px-4 py-2 rounded-xl flex gap-2 items-center w-full">
          <HiSearch size={24} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onClick={() => setCollectionsShow(true)}
            placeholder="Search Projects"
            className="w-full border-none text-md bg-transparent focus:outline-none hover:outline-none ring-none"
          />
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
          show={collectionsShow}
        >
          <Menu.Items className="absolute right-0 z-[10] mt-2 w-full origin-top-right rounded-lg bg-dark-800 shadow-lg py-3 border border-dark-400">
            <div className="text-bold text-lg px-4">Collections</div>
            <div className="flex flex-col py-1">
              {collections
                ? collections.map((collection, idx) => (
                    <Menu.Item key={idx}>
                      {({ active }) => (
                        <Link href={`/project/${collection.slug}`}>
                          <button
                            className={clsx(
                              active
                                ? "bg-dark-500 text-gray-100"
                                : "text-gray-200",
                              "px-3 py-3 text-sm rounded-lg w-full z-[100]"
                            )}
                            onClick={() => {
                              setCollectionsShow(false);
                            }}
                          >
                            <p className="flex justify-start items-center gap-2">
                              <img
                                src={
                                  collection.imageUrl ??
                                  "/images/AvatarPlaceholder-1.png"
                                }
                                className={`w-7 h-7 rounded-md`}
                                alt=""
                              />
                              <span className="font-bold mr-2 flex-1 capitalize text-left">
                                {collection.name}
                              </span>
                              {NetworkIcon[collection.network]}
                            </p>
                          </button>
                        </Link>
                      )}
                    </Menu.Item>
                  ))
                : null}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
