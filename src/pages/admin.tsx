import { AdminLottery } from "@/frontend/components/Admin/AdminLottery";
import { AdminRaffles } from "@/frontend/components/Admin/AdminRaffles";
import { MasterAdmin } from "@/frontend/components/Admin/MasterAdmin";
import { Verifications } from "@/frontend/components/Admin/Verifications";
import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { LoginView } from "@/frontend/components/LoginView";
import { useUserDetails } from "@/frontend/hooks/useUserDetails";
import { OAuthProviders } from "@/shared/types";
import { Tab } from "@headlessui/react";
import { UserType } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Fragment } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";
  const isAdmin =
    session?.user?.type === UserType.ADMIN ||
    session?.user?.type === UserType.MASTER;

  const { data: userDetails, isLoading: userDetailsLoading } = useUserDetails();

  const discordAccount = userDetails?.accounts?.find(
    (account) => account.provider === OAuthProviders.DISCORD
  );

  const isLoading = sessionLoading;

  if (
    (!isLoading && !userDetailsLoading && !session) ||
    (!isLoading && !userDetailsLoading && !discordAccount)
  ) {
    return <LoginView />;
  }

  if (!isAdmin)
    return (
      <PublicLayout>
        <div className="flex justify-center mx-auto  mt-12 text-white">
          <div>
            <img src="/images/wut.gif" alt="" className="w-96" />
            <p className="flex justify-center mt-6">Nice try</p>
          </div>
        </div>
      </PublicLayout>
    );

  return (
    <PublicLayout>
      <div>
        <h1 className="text-white md:text-3xl text-2xl py-4 font-bold text-center">
          Admin
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
                        Verifications
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
                        Raffles
                      </button>
                    )}
                  </Tab>
                  {session?.user.type === UserType.MASTER && (
                    <Tab as={Fragment}>
                      {({ selected }) => (
                        <button
                          className={`${
                            selected && "bg-primary-500"
                          }  py-2 px-3 rounded-lg text-sm xs:w-40`}
                        >
                          Lottery
                        </button>
                      )}
                    </Tab>
                  )}
                  {session?.user.type === UserType.MASTER && (
                    <Tab as={Fragment}>
                      {({ selected }) => (
                        <button
                          className={`${
                            selected && "bg-primary-500"
                          }  py-2 px-3 rounded-lg text-sm xs:w-40`}
                        >
                          Master
                        </button>
                      )}
                    </Tab>
                  )}
                </Tab.List>
              </div>
            </div>

            <Tab.Panels>
              <Tab.Panel className="mt-3">
                <Verifications />
              </Tab.Panel>
              <Tab.Panel className="mt-3">
                <AdminRaffles />
              </Tab.Panel>
              {session?.user.type === UserType.MASTER && (
                <>
                  <Tab.Panel className="mt-3">
                    <AdminLottery />
                  </Tab.Panel>
                  <Tab.Panel className="mt-3">
                    <MasterAdmin />
                  </Tab.Panel>
                </>
              )}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </PublicLayout>
  );
}
