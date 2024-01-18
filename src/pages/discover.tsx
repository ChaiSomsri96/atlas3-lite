import { AllProjects } from "@/frontend/components/Dashboard/AllProjects";
import { AllGiveaways } from "@/frontend/components/Discover/AllGiveaways";
import { UpcomingProjects } from "@/frontend/components/Discover/UpcomingProjects";
import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { Tab } from "@headlessui/react";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

export default function Discover() {
  const router = useRouter();
  const [tabIdx, setTabIdx] = useState(0);

  useEffect(() => {
    if (router.query.tab) {
      const tab = router.query.tab as string;
      if (tab == "all_projects") {
        setTabIdx(0);
      } else if (tab == "all_giveaways") {
        setTabIdx(1);
      } else if (tab == "upcoming_projects") {
        setTabIdx(2);
      }
    }
  }, [router]);

  useEffect(() => {
    if (tabIdx == 0) {
      router.replace("/discover?tab=all_projects");
    } else if (tabIdx == 1) {
      router.replace("/discover?tab=all_giveaways");
    } else if (tabIdx == 2) {
      router.replace("/discover?tab=upcoming_projects");
    }
  }, [tabIdx]);

  return (
    <PublicLayout>
      <div>
        <p className="text-2xl font-bold text-center py-6">
          Explore everything, in one page
        </p>

        <Tab.Group selectedIndex={tabIdx}>
          <Tab.List className="bg-dark-600 grid sm:grid-cols-3 grid-cols-2 justify-between rounded-lg p-1 sm:w-fit w-full gap-y-2">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`${
                    selected && "bg-twitter"
                  }  py-2 px-3 rounded-lg text-sm sm:w-28 w-full outline-none col-span-1`}
                  onClick={() => setTabIdx(0)}
                >
                  All Projects
                </button>
              )}
            </Tab>

            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`${
                    selected && "bg-twitter"
                  }  py-2 px-3 rounded-lg text-sm sm:w-32 w-full outline-none col-span-1`}
                  onClick={() => setTabIdx(1)}
                >
                  All giveaways
                </button>
              )}
            </Tab>

            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`${
                    selected && "bg-twitter"
                  }  py-2 px-3 rounded-lg text-sm w-38 outline-none sm:col-span-1 col-span-2`}
                  onClick={() => setTabIdx(2)}
                >
                  Upcoming Projects
                </button>
              )}
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel className="mt-3">
              <AllProjects notMine={false} />
            </Tab.Panel>
            <Tab.Panel className="mt-3">
              <AllGiveaways />
            </Tab.Panel>
            <Tab.Panel className="mt-3">
              <UpcomingProjects />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </PublicLayout>
  );
}
