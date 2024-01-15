import { AdminProjectsTable } from "@/frontend/components/Admin/AdminProjectsTable";
import { useHandleManualVerifyProject } from "@/frontend/handlers/useHandleManualVerifyProject";
import { PrimaryButton } from "@/styles/BaseComponents";
import { Input } from "@/styles/FormComponents";
import { Dialog, Transition } from "@headlessui/react";
import { CloseSquare } from "iconsax-react";
import { Fragment, useState } from "react";
import toast from "react-hot-toast";

export const Verifications = () => {
  const [isVerifyOpen, setVerifyOpen] = useState<boolean>(false);

  const [projectSlug, setProjectSlug] = useState<string>("");
  const [twitterUsername, setTwitterUsername] = useState<string>("");
  const handleVerifyProject = useHandleManualVerifyProject();

  const handleVerifyProjectSubmit = () => {
    setVerifyOpen(false);

    let username = twitterUsername;
    // remove @ from twitter username if exists
    if (twitterUsername.startsWith("@")) {
      username = twitterUsername.slice(1);
    }

    const loadingId = toast.loading("Processing verification...");
    handleVerifyProject.mutate(
      {
        projectSlug,
        twitterUsername: username,
      },
      {
        onSuccess: async () => {
          toast.success("Successfully linked twitter and verified", {
            id: loadingId,
          });
        },
      }
    );
  };

  return (
    <>
      <div>
        <div className="flex">
          <PrimaryButton onClick={() => setVerifyOpen(true)}>
            Verify Manually
          </PrimaryButton>
        </div>
        <AdminProjectsTable />
      </div>

      <Transition appear show={isVerifyOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setVerifyOpen(false)}
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

          <div className="fixed inset-0 max-h-screen overflow-y-auto">
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
                <Dialog.Panel className="w-1/3 max-w-4xl transform overflow-hidden rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-primary-500 max-h-full h-96">
                  <Dialog.Title className="flex justify-between">
                    <h3 className="text-lg font-medium leading-6 text-white">
                      Verify Project
                    </h3>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setVerifyOpen(false)}
                    >
                      <CloseSquare size={32} />
                    </button>
                  </Dialog.Title>
                  <div>
                    <div className="my-4 ">
                      <label className="block text-sm font-medium mb-2 dark:text-white">
                        Project Slug
                      </label>
                      <Input
                        type="text"
                        id="slug"
                        onChange={(e) => setProjectSlug(e.target.value)}
                        placeholder="blocksmith-labs"
                      />
                    </div>
                  </div>

                  <div className="my-4 ">
                    <label className="block text-sm font-medium mb-2 dark:text-white">
                      Twitter Username
                    </label>
                    <Input
                      type="text"
                      id="twitterUsername"
                      onChange={(e) => setTwitterUsername(e.target.value)}
                      placeholder="@"
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setVerifyOpen(false)}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleVerifyProjectSubmit}
                    >
                      Verify Project
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
