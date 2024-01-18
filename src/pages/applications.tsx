import NonPendingApplications from "@/frontend/components/Applications/NonPendingApplications";
import PendingApplications from "@/frontend/components/Applications/PendingApplications";
import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { Tab } from "@headlessui/react";
import { Fragment } from "react";

export default function Applications() {
  return (
    <PublicLayout>
      <div>
        <h1 className="text-white md:text-3xl text-2xl py-4 font-bold text-center">
          Applications
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
                        Live
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
                        Pending
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
                        Approved
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
                        Rejected
                      </button>
                    )}
                  </Tab>
                </Tab.List>
              </div>
            </div>

            <Tab.Panels>
              <Tab.Panel className="mt-3">
                <PendingApplications />
              </Tab.Panel>
              <Tab.Panel className="mt-3">
                <NonPendingApplications applicationStatus="PENDING" />
              </Tab.Panel>
              <Tab.Panel className="mt-3">
                <NonPendingApplications applicationStatus="APPROVED" />
              </Tab.Panel>
              <Tab.Panel className="mt-3">
                <NonPendingApplications applicationStatus="REJECTED" />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </PublicLayout>
  );
}
