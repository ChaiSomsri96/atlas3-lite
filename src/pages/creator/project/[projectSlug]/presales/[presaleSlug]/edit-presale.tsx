import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { Loader } from "@/frontend/components/Loader";
import { usePresale } from "@/frontend/hooks/usePresale";
import { useRouter } from "next/router";
import { CreateOrEditPresale } from "../../new-presale";

export default function EditPresale() {
  const { presaleSlug, projectSlug } = useRouter().query;

  const { data: presale, isLoading: giveawayLoading } = usePresale({
    projectSlug: projectSlug as string,
    presaleSlug: presaleSlug as string,
  });

  if (giveawayLoading)
    return (
      <PublicLayout>
        <Loader />
      </PublicLayout>
    );

  return (
    <PublicLayout>
      {presale && <CreateOrEditPresale presale={presale} mode={"edit"} />}
    </PublicLayout>
  );
}
