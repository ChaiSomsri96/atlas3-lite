import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { ProjectsForPurchaseDropdown } from "@/frontend/components/Marketplace/ProjectsForPurchaseDropdown";
import {
  CreateMarketplacePurchaseInput,
  useHandleCreateMarketplacePurchase,
} from "@/frontend/handlers/useHandleCreateMarketplacePurchase";
import { useMarketplaceUserProjectsForPurchase } from "@/frontend/hooks/useMarketplaceUserProjectsForPurchase";
import { FormInner, Input, Label, SubmitButton } from "@/styles/FormComponents";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useAllowlistRoles } from "@/frontend/hooks/useAllowlistRoles";
import { Loader } from "@/frontend/components/Loader";
import toast from "react-hot-toast";

export default function NewProject() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const handleCreatePurchase = useHandleCreateMarketplacePurchase();
  const { data: projects } = useMarketplaceUserProjectsForPurchase();

  const { register, setValue, watch, handleSubmit } =
    useForm<CreateMarketplacePurchaseInput>();

  const { data: discordRoles, isLoading: rolesLoading } = useAllowlistRoles({
    projectId: watch("projectId"),
    projectSlug: undefined,
  });

  const onSubmit = (data: CreateMarketplacePurchaseInput) => {
    if (data.pointsCost <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    data.tradeType = "BUY";
    handleCreatePurchase.mutate(data);
  };

  if (!loading && !session) return <PublicLayout>Not Signed in</PublicLayout>;
  return (
    <PublicLayout>
      <h1 className="text-2xl font-semibold mb-6">Create Buy Order</h1>
      <h2 className="text-lg font-semibold">General Details</h2>
      <p className="text-sm mb-3">
        Enter the details for the allowlist you want to buy on the marketplace.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInner>
          <div>
            <Label>Projects</Label>
            <ProjectsForPurchaseDropdown
              allProjects={projects}
              setValue={(value) => setValue(`projectId`, value)}
              {...register(`projectId`)}
            />
          </div>
          {rolesLoading && <Loader />}
          {!rolesLoading && discordRoles?.length === 0 && (
            <p className="text-sm text-primary-400">
              This project does not have any allowlist roles configured meaning
              you will not get a discord role and only your wallet will be
              submitted.
            </p>
          )}
          {!rolesLoading && discordRoles && discordRoles.length > 0 && (
            <div className="mt-2">
              <Label>Allowlist Role To Purchase</Label>
              <select
                id="giveawayRoleId"
                {...register("roleId")}
                className={`form-select w-full rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400`}
                defaultValue={undefined}
                required={discordRoles && discordRoles.length > 0}
              >
                <option value={undefined}>Select One</option>
                {discordRoles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-2">
            <Label>Points Cost</Label>
            <Input
              type="number"
              onWheel={() => {
                if (document.activeElement instanceof HTMLElement) {
                  document?.activeElement?.blur();
                }
              }}
              id="name"
              step="0.01"
              {...register("pointsCost", {
                valueAsNumber: true,
              })}
              placeholder="Placeholder"
              required={true}
            />
          </div>

          <div className="mb-2 text-orange-500 text-sm">
            Make sure you have a default wallet address configured for this
            projects network as this will be added to this projects allowlist if
            somebody sells to you.
          </div>
          <p className="text-sm text-orange-500 mb-2">
            If this buy order fulfills, the allowlist entry and discord role
            (where applicable) will be transferred from the buyer to you.
          </p>
          <SubmitButton type="submit">Submit</SubmitButton>
        </FormInner>
      </form>
    </PublicLayout>
  );
}
