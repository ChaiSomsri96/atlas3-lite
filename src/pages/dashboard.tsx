import MyGiveaways from "@/frontend/components/Dashboard/MyGiveaways";
import MyPresales from "@/frontend/components/Dashboard/MyPresales";
import MyProjects from "@/frontend/components/Dashboard/MyProjects";
import MyWalletSubmissions from "@/frontend/components/Dashboard/MyWalletSubmissions";
import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { LoginView } from "@/frontend/components/LoginView";
import { useUserDetails } from "@/frontend/hooks/useUserDetails";
import { OAuthProviders } from "@/shared/types";
import { Tab } from "@headlessui/react";
import { useSession } from "next-auth/react";
import { Fragment } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

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

  return (
    <PublicLayout>
      {isLoading || userDetailsLoading ? (
        <></>
      ) : (
        <div>
          <p className="text-2xl font-bold text-center py-6">
            Welcome back {session?.user.name}
          </p>

          <Tab.Group>
            <Tab.List className="bg-dark-600 flex justify-between rounded-lg p-1 w-fit">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`${
                      selected && "bg-primary-500"
                    }  py-2 px-3 rounded-lg text-sm xs:w-40`}
                  >
                    Wallet Submissions
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
                    My Projects
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`${
                      selected && "bg-primary-500"
                    }  py-2 px-3 rounded-lg text-sm xs:w-32`}
                  >
                    My Giveaways
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`${
                      selected && "bg-primary-500"
                    }  py-2 px-3 rounded-lg text-sm xs:w-32`}
                  >
                    My Presales
                  </button>
                )}
              </Tab>
            </Tab.List>

            <Tab.Panels>
              <Tab.Panel className="mt-3">
                <MyWalletSubmissions />
              </Tab.Panel>
              <Tab.Panel className="mt-3">
                <MyProjects />
              </Tab.Panel>
              <Tab.Panel className="mt-3">
                <MyGiveaways />
              </Tab.Panel>
              <Tab.Panel className="mt-3">
                <MyPresales />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      )}
    </PublicLayout>
  );
}
