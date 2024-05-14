import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { Loader } from "@/frontend/components/Loader";
import { useHandleStoreOmb } from "@/frontend/handlers/useHandleStoreOmb";
import { useGetOmbAllocation } from "@/frontend/hooks/useGetOmbAllocation";
import { Input, Label, SubmitButton } from "@/styles/FormComponents";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
// import Loader from '...'; // Import your Loader component here

export default function OMB() {
  const { data: ret, isLoading } = useGetOmbAllocation();
  const [allocation, setAllocation] = useState<number>(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const handleAddWallet = useHandleStoreOmb();
  const { data: session } = useSession();

  useEffect(() => {
    if (ret) {
      setAllocation(ret.allocation);
      // Prepare wallets data if it exists, else create new inputs
      let updatedInputs =
        ret.wallets?.length > 0
          ? [...ret.wallets]
          : Array(ret.allocation).fill("");
      // If the allocation decreases, remove the excess wallets
      if (updatedInputs.length > ret.allocation) {
        updatedInputs = updatedInputs.slice(0, ret.allocation);
      }
      // If the allocation increases, add additional empty fields
      while (updatedInputs.length < ret.allocation) {
        updatedInputs.push("");
      }
      setInputs(updatedInputs);
    }
  }, [ret]);

  const handleSubmit = () => {
    // Here goes the logic when you press the submit button
    handleAddWallet.mutate({ wallets: inputs });
  };

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newInputs = [...inputs];
    newInputs[index] = event.target.value;
    setInputs(newInputs);
  };

  if (!session) {
    return (
      <PublicLayout>
        <div>
          <h1 className="text-white md:text-3xl text-2xl py-4 font-bold text-center">
            Ordinal Maxi Biz
          </h1>
          <h2 className="text-white md:text-3xl text-xl py-4 font-bold text-center">
            You must be logged in to view this page
          </h2>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div>
        <h1 className="text-white md:text-3xl text-2xl py-4 font-bold text-center">
          Ordinal Maxi Biz
        </h1>
        {isLoading ? (
          <Loader /> // Shows when isLoading is true
        ) : (
          <h2 className="text-white md:text-3xl text-xl py-4 font-bold text-center">
            You have an allocation of {allocation}
          </h2>
        )}

        {inputs.map((input, index) => (
          <div className="mt-2" key={index}>
            <Label>Wallet {index + 1}</Label>
            <Input
              type="text"
              id={`wallet-${index}`}
              placeholder="Placeholder"
              value={input}
              onChange={(event) => handleInputChange(index, event)}
              disabled={true} // field is disabled if it was initially filled
            />
          </div>
        ))}

        {allocation > 0 && (
          <>
            <SubmitButton
              onClick={handleSubmit}
              className="mt-4"
              disabled={true}
            >
              Submit
            </SubmitButton>
            <h2 className="text-white text-xs text-red-500 py-4 font-bold text-center">
              Wallet submission is now closed.
            </h2>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
