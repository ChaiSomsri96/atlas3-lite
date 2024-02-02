import React, { useState } from "react";
import { GridElement, Heading } from "./SharedFormElements";

function CommunitiesForm() {
  const [requirementsCount, setRequirementsCount] = useState<number>(1);
  const dummyOptions = ["BSL Holder", "ABC Holder", "DeGods Holder"];

  const Requirements = () => {
    return (
      <div className="flex flex-row gap-2 items-center mb-5 justify-between sm:grid sm:grid-flow-col">
        <span className="sm:col-span-6">
          <GridElement label="Requirement Type">
            <select
              className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-3 px-4"
              placeholder="Input text here"
            >
              {dummyOptions.map((requirement, index) => (
                // Since we are going to map this jsx element multiple elements, better create a strong key(timestamp added?)
                <option value={requirement} key={index} className="pr-4">
                  {requirement}
                </option>
              ))}
            </select>
          </GridElement>
        </span>

        <span className="sm:col-span-6">
          <GridElement label="Spots">
            <input
              type="number"
              min={1}
              className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-3 px-4"
            />
          </GridElement>
        </span>

        <h3 className="font-bold text-sm leading-4 text-[#EF4444] mt-10 mr-5 col-span-1">
          Remove
        </h3>
      </div>
    );
  };

  return (
    <>
      {/* ----------- Heading -------------------------*/}
      <Heading title="Allocate to more communities" description="" />
      {[...Array(requirementsCount)].map((element) => (
        <Requirements key={element} />
      ))}
      <button
        className="font-bold bg-transparent text-sm leading-4 border-primary-500 text-primary-500 px-[18px] py-[15.5px] border-[1px] rounded-xl"
        onClick={() => setRequirementsCount((requirements) => requirements + 1)}
      >
        Add requirement
      </button>
    </>
  );
}

export default CommunitiesForm;
