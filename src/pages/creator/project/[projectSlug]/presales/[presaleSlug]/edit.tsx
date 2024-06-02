import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { Loader } from "@/frontend/components/Loader";
import { useGiveaway } from "@/frontend/hooks/useGiveaway";
import { useRouter } from "next/router";
import { CreateOrEditGiveaway } from "../../new-giveaway";

export default function EditGiveaway() {
  const { giveawaySlug, projectSlug } = useRouter().query;

  const { data: giveaway, isLoading: giveawayLoading } = useGiveaway({
    projectSlug: projectSlug as string,
    giveawaySlug: giveawaySlug as string,
  });

  if (giveawayLoading)
    return (
      <PublicLayout>
        <Loader />
      </PublicLayout>
    );

  return (
    <PublicLayout>
      {giveaway && <CreateOrEditGiveaway giveaway={giveaway} mode={"edit"} />}
    </PublicLayout>
  );
}
