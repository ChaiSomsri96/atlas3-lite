import { ApplicationCard } from "@/frontend/components/ApplicationCard";
import { Loader } from "@/frontend/components/Loader";
import { useGetUserPendingApplications } from "@/frontend/hooks/useGetUserPendingApplications";

import { useSession } from "next-auth/react";
export default function NonPendingApplications({
  applicationStatus,
}: {
  applicationStatus: string;
}) {
  const { data: ret, isLoading } =
    useGetUserPendingApplications(applicationStatus);

  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  if (!session && !sessionLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col justify-center items-center gap-3">
          <p className="text-gray-200 text-2xl font-semibold">
            Please login to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {ret && ret.applications.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
              {ret.applications?.map((application) => (
                <ApplicationCard
                  key={application.id}
                  setSelectedApplication={() => {
                    // setSelectedApplication(application);
                  }}
                  application={application}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
