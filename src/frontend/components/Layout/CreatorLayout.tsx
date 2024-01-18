import { Header } from "./Header";
import CreatorSidebar from "../CreatorSidebar";
import { useOwnedProjects } from "@/frontend/hooks/useOwnedProjects";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { Project } from "@prisma/client";
import { useRouter } from "next/router";
import { DiscordAnnouncement } from "../Announcements/DiscordAnnouncement";
import { TwitterAnnouncement } from "../Announcements/TwitterAnnouncement";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: projects, isLoading: projectsLoading } = useOwnedProjects();
  const [selectedProject, setselectedProject] = useState<Project>();
  const router = useRouter();
  const [showVerifyTwitterModal, setShowVerifyTwitterModal] = useState(false);

  useEffect(() => {
    if (projects && projects.length > 0) {
      if (router.query.projectSlug) {
        const project = projects.find(
          (project) => project.slug === router.query.projectSlug
        );
        if (project) {
          setselectedProject(project);

          if (!project.twitterUsername) {
            setShowVerifyTwitterModal(true);
          }
        }
      }
    }
  }, [projects]);

  return (
    <div>
      <Header variant={"creator"} />

      <div className="flex">
        <div className="sticky top-0 h-screen md:bg-transparent bg-dark-900 w-80 hidden lg:block px-4 sm:px-6 lg-px-8 overflow-y-auto sidebar-scroll pb-16">
          <CreatorSidebar />
        </div>

        <div className="flex-grow">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {!projectsLoading &&
              projects &&
              projects.length > 0 &&
              selectedProject && (
                <>
                  {!selectedProject?.discordGuild && (
                    <DiscordAnnouncement selectedProject={selectedProject} />
                  )}
                </>
              )}
            <div className="mt-3 sm:mt-8">{children}</div>
          </main>
        </div>
      </div>

      <Transition appear show={showVerifyTwitterModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowVerifyTwitterModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-primary-500">
                  <Dialog.Title className="flex justify-between"></Dialog.Title>
                  <div className="mt-5 text-white text-md">
                    {selectedProject && (
                      <TwitterAnnouncement selectedProject={selectedProject} />
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setShowVerifyTwitterModal(false)}
                    >
                      OK
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
