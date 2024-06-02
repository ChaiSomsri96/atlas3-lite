import { EmptyState } from "@/frontend/components/EmptyState";
import CreatorLayout from "@/frontend/components/Layout/CreatorLayout";
import { Loader } from "@/frontend/components/Loader";
import { useProject } from "@/frontend/hooks/useProject";
import { Menu, Transition } from "@headlessui/react";
import { PresaleStatus } from "@prisma/client";
import { More } from "iconsax-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useMemo } from "react";
import { HiArrowLeft, HiDownload } from "react-icons/hi";
import { usePresale } from "@/frontend/hooks/usePresale";
import { useHandleUpdatePresaleState } from "@/frontend/handlers/useHandleUpdatePresaleState";
import { PresaleEntriesTable } from "@/frontend/components/Table/PresaleEntriesTable";

export default function Entries() {
  const router = useRouter();
  const { projectSlug, presaleSlug } = router.query;

  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  const { data: project, isLoading: projectLoading } = useProject({
    slug: projectSlug as string,
  });

  const { data: presale, isLoading: giveawayLoading } = usePresale({
    projectSlug: projectSlug as string,
    presaleSlug: presaleSlug as string,
  });

  const loading = sessionLoading || projectLoading || giveawayLoading;

  const handleUpdatePresale = useHandleUpdatePresaleState();

  const isUserAllowed = !!project?.roles.find(
    (role) => role.userId === session?.user?.id
  );

  const statusDiv = useMemo(() => {
    if (!presale) {
      return "";
    }

    if (presale.status == PresaleStatus.RUNNING) {
      return (
        <div className="bg-success-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <span className="text-white">Live</span>
        </div>
      );
    } else if (presale.status == PresaleStatus.FINALIZED) {
      return (
        <div className="bg-red-500 px-3 py-1 rounded-md flex gap-2 items-center w-fit">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <span className="text-white">Ended</span>
        </div>
      );
    }
  }, [presale]);

  return (
    <CreatorLayout>
      {loading ? (
        <Loader />
      ) : !project || !presale || !isUserAllowed ? (
        <EmptyState content="Giveaway not found." />
      ) : (
        <div>
          <div className="flex justify-between items-center">
            <div className="flex sm:flex-row flex-col gap-2 items-center">
              <div className="flex gap-2">
                <Link href={`/creator/project/${projectSlug}/presales`}>
                  <button
                    type="button"
                    className="bg-gray-800 px-2 py-2 rounded-xl flex gap-2 items-center"
                  >
                    <HiArrowLeft size={20} />
                  </button>
                </Link>
                <h2 className="text-2xl font-bold">{presale.name}</h2>
              </div>

              <div className="flex gap-2">{statusDiv}</div>
            </div>

            <div className="mt-4 flex gap-2">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex w-full justify-center rounded-md bg-transparent border border-primary-500 px-4 py-2 text-twitter">
                    <More size={20} />
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
                  <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-gray-100 rounded-lg bg-slate-800 shadow-lg border border-sky-500 z-[1000]">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({}) => (
                          <Link
                            href={`/api/creator/project/${project.slug}/presale/${presale.slug}/download-entries`}
                          >
                            <button
                              className={`bg-transparent text-white group flex w-full items-center rounded-md px-2 py-2 text-sm hover:text-primary-500`}
                            >
                              <div className="bg-slate-900 p-2 rounded-lg mr-4">
                                <HiDownload className="h-5 w-5" />
                              </div>
                              <span>Export all</span>
                            </button>
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {presale.status !== PresaleStatus.FINALIZED && (
                <button
                  className="rounded-lg bg-primary-500 px-4 py-2 text-md font-medium"
                  onClick={() => {
                    handleUpdatePresale.mutate({
                      projectSlug: project.slug,
                      presaleSlug: presale.slug,
                      status: PresaleStatus.FINALIZED,
                    });
                  }}
                >
                  End Presale
                </button>
              )}
            </div>
          </div>

          <PresaleEntriesTable project={project} presale={presale} />
        </div>
      )}
    </CreatorLayout>
  );
}
