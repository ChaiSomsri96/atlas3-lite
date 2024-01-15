import { useHandleMasterUnverifyProject } from "@/frontend/handlers/useHandleMasterUnverifyProject";
import { useHandleMasterDeleteProject } from "@/frontend/handlers/useHandleMasterDeleteProject";
import { useHandleMasterRenameProject } from "@/frontend/handlers/useHandleMasterRenameProject";
import { Input } from "@/styles/FormComponents";
import { useState } from "react";
import toast from "react-hot-toast";
import { useHandleMasterFeatureProject } from "@/frontend/handlers/useHandleMasterFeatureProject";

export const MasterAdmin = () => {
  const [deleteProjectSlug, setDeleteProjectSlug] = useState<string>("");
  const [renameProjectOldSlug, setRenameOldProjectSlug] = useState<string>("");
  const [renameProjectNewSlug, setRenameNewProjectSlug] = useState<string>("");
  const [unverifyProjectSlug, setUnverifyProjectSlug] = useState<string>("");
  const [featureProjectSlug, setFeatureProjectSlug] = useState<string>("");
  const handleDeleteProject = useHandleMasterDeleteProject();
  const handleRenameProject = useHandleMasterRenameProject();
  const handleUnverifyProject = useHandleMasterUnverifyProject();
  const handleFeatureProject = useHandleMasterFeatureProject();

  const handleDeleteProjectSlugSubmit = () => {
    const loadingId = toast.loading("Processing delete...");
    handleDeleteProject.mutate(
      {
        projectSlug: deleteProjectSlug,
      },
      {
        onSuccess: async () => {
          toast.success("Successfully deleted", {
            id: loadingId,
          });
        },
        onError: async (error) => {
          toast.error((error as Error).message, { id: loadingId });
        },
      }
    );
  };

  const handleRenameProjectSlugSubmit = () => {
    const loadingId = toast.loading("Processing rename...");
    handleRenameProject.mutate(
      {
        oldProjectSlug: renameProjectOldSlug,
        newProjectSlug: renameProjectNewSlug,
      },
      {
        onSuccess: async () => {
          toast.success("Successfully renamed", {
            id: loadingId,
          });
        },
        onError: async (error) => {
          toast.error((error as Error).message, { id: loadingId });
        },
      }
    );
  };

  const handleUnverifyProjectSlugSubmit = () => {
    const loadingId = toast.loading("Processing unverify...");
    handleUnverifyProject.mutate(
      {
        projectSlug: unverifyProjectSlug,
      },
      {
        onSuccess: async () => {
          toast.success("Successfully unverified", {
            id: loadingId,
          });
        },
        onError: async (error) => {
          toast.error((error as Error).message, { id: loadingId });
        },
      }
    );
  };

  const handleFeatureProjectSlugSubmit = (featured: boolean) => {
    const loadingId = toast.loading("Processing feature...");
    handleFeatureProject.mutate(
      {
        projectSlug: featureProjectSlug,
        featured,
      },
      {
        onSuccess: async () => {
          toast.success(
            `Successfully ${featured ? "featured" : "unfeatured"}`,
            {
              id: loadingId,
            }
          );
        },
        onError: async (error) => {
          toast.error((error as Error).message, { id: loadingId });
        },
      }
    );
  };

  return (
    <>
      <div>
        <div className="flex gap-2">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Project Slug
            </label>
            <Input
              type="text"
              id="slug"
              onChange={(e) => setDeleteProjectSlug(e.target.value)}
              placeholder="blocksmith-labs"
            />
          </div>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={handleDeleteProjectSlugSubmit}
            >
              Delete Project
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <div className="my-4 ">
              <label className="block text-sm font-medium mb-2 dark:text-white">
                Old Project Slug
              </label>
              <Input
                type="text"
                id="slug"
                onChange={(e) => setRenameOldProjectSlug(e.target.value)}
                placeholder="blocksmith-labs"
              />
            </div>
          </div>
          <div className="my-4 ">
            <label className="block text-sm font-medium mb-2 dark:text-white">
              New Project Slug
            </label>
            <Input
              type="text"
              id="slug"
              onChange={(e) => setRenameNewProjectSlug(e.target.value)}
              placeholder="blocksmith-labs"
            />
          </div>
          <div className="mt-10">
            <button
              type="button"
              className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={handleRenameProjectSlugSubmit}
            >
              Rename Project Slug
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="">
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Project Slug
            </label>
            <Input
              type="text"
              id="slug"
              onChange={(e) => setUnverifyProjectSlug(e.target.value)}
              placeholder="blocksmith-labs"
            />
          </div>
          <div className="mt-6 mb-2">
            <button
              type="button"
              className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={handleUnverifyProjectSlugSubmit}
            >
              Unverify Project
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Project Slug
            </label>
            <Input
              type="text"
              id="slug"
              onChange={(e) => setFeatureProjectSlug(e.target.value)}
              placeholder="blocksmith-labs"
            />
          </div>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex mx-2 justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => {
                handleFeatureProjectSlugSubmit(true);
              }}
            >
              Feature Project
            </button>
            <button
              type="button"
              className="inline-flex justify-center rounded-lg border border-transparent bg-primary-500 px-4 py-3 text-xs font-medium text-white hover:bg-white hover:text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={() => {
                handleFeatureProjectSlugSubmit(false);
              }}
            >
              Unfeature Project
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
