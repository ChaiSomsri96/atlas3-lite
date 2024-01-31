import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import {
  CreateMarketplaceListingInput,
  useHandleCreateMarketplaceListing,
} from "@/frontend/handlers/useHandleCreateMarketplaceListing";
import { useMarketplaceGetBestBuyOrder } from "@/frontend/hooks/useMarketplaceGetBestBuyOrder";
import { useMarketplaceUserProjectsForListing } from "@/frontend/hooks/useMarketplaceUserProjectsForListing";
import {
  FormInner,
  Input,
  Label,
  Select,
  SubmitButton,
} from "@/styles/FormComponents";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function NewProject() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const handleCreateListing = useHandleCreateMarketplaceListing();
  const { data: projects } = useMarketplaceUserProjectsForListing();
  const { register, handleSubmit, watch } =
    useForm<CreateMarketplaceListingInput>();

  const pointCost = watch("pointsCost");

  const onSubmit = (data: CreateMarketplaceListingInput) => {
    if (data.pointsCost <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    data.tradeType = "SELL";
    handleCreateListing.mutate(data);
  };

  const { data: projectBestBuyOrderPoints } = useMarketplaceGetBestBuyOrder({
    projectId: watch("projectId"),
  });

  if (!loading && !session) return <PublicLayout>Not Signed in</PublicLayout>;

  if (projects && projects.length === 0) {
    return <PublicLayout>You do not have any allowlists to sell.</PublicLayout>;
  }

  return (
    <PublicLayout>
      <h1 className="text-2xl font-semibold mb-6">Create Listing</h1>
      <h2 className="text-lg font-semibold">General Details</h2>
      <p className="text-sm mb-3">
        Enter the details for the allowlist you want to list on the marketplace.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInner>
          <div>
            <Label>Projects</Label>
            <Select id={`projectId`} {...register(`projectId`)}>
              <option value={undefined}>Select One</option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}{" "}
                  {!project.allowlistTradingEnabled &&
                    "(Allowlist Trading Disabled)"}
                  {!project.allowlistEnabled &&
                    "(Allowlist Submissions Closed)"}
                </option>
              ))}
            </Select>
            <p className="text-sm mt-2 text-orange-500">
              If a project is not showing here, it means you have either not
              claimed your allowlist or the project has disabled allowlist
              trading. You can check if you have claimed your allowlist by going
              to the project page.
            </p>
          </div>

          <div className="">
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
            />
            {!isNaN(pointCost) && pointCost > 0 && (
              <p className="text-sm mt-2 text-success-500">
                After fees, you will receive{" "}
                {Number(pointCost * 0.95).toFixed(2)} points.
              </p>
            )}
          </div>

          {projectBestBuyOrderPoints &&
            projectBestBuyOrderPoints.points > 0 && (
              <div className="mb-2 text-success-500 text-sm">
                The current best buy order for this project is{" "}
                {projectBestBuyOrderPoints.points / 1000} points. You can sell
                directly to this through the buy orders tab.
              </div>
            )}
          {projectBestBuyOrderPoints &&
            projectBestBuyOrderPoints.floorPrice > 0 && (
              <div className="mb-2 text-success-500 text-sm">
                The current floor price for this project is{" "}
                {projectBestBuyOrderPoints.floorPrice / 1000} points.
              </div>
            )}
          <p className="text-sm text-orange-500 mb-2">
            Be aware that when you list this allowlist for sale, your discord
            role will be removed instantly. If you decide to de-list, you will
            receive your role back.
          </p>

          <SubmitButton type="submit">Submit</SubmitButton>
        </FormInner>
      </form>
    </PublicLayout>
  );
}
