import React from "react";
import { GridElement, Heading } from "./SharedFormElements";
import { BlockchainNetwork } from "@prisma/client";
import { RequestCollab } from "@/shared/types";
import { useFormContext } from "react-hook-form";

function MintDetailsForm() {
  const { register } = useFormContext<RequestCollab>();

  return (
    <>
      {/* ----------- Heading -------------------------*/}
      <Heading
        title="Mint Details"
        description="Enter all your project details. The more accurate the description, the better chance to be approved by the other project."
      />

      {/* ----------- Sub heading -------------------------*/}
      <GridElement label="Project Blockchain">
        {/* TODO: Add dynamic radio buttons */}
        <>
          {Object.keys(BlockchainNetwork)?.map((network, index) => (
            <div className="flex items-center mt-3" key={index}>
              <input
                type="radio"
                value={network}
                {...register("blockchainNetwork")}
                className="h-5 w-5 border-primary-500 focus:ring-2 focus:ring-primary-500"
              />
              <label className="text-sm text-neutral-50 ml-2 block">
                {network}
              </label>
            </div>
          ))}
        </>
      </GridElement>
      <div className="grid grid-cols-2 col-span-2 gap-[10px]">
        <GridElement label="Supply">
          <input
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] px-4"
            placeholder="Input text here"
            type="number"
            onWheel={() => {
              if (document.activeElement instanceof HTMLElement) {
                document?.activeElement?.blur();
              }
            }}
            min={1}
            {...register("supply")}
          />
        </GridElement>
        <GridElement label="Mint Price">
          <input
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] px-4"
            placeholder="Input text here"
            type="number"
            onWheel={() => {
              if (document.activeElement instanceof HTMLElement) {
                document?.activeElement?.blur();
              }
            }}
            min={0}
            {...register("mintPrice")}
          />
        </GridElement>
        <GridElement label="Public Mint Date">
          <input
            type="date"
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] px-4"
            placeholder="Input text here"
            {...register("publicMintDate")}
          />
        </GridElement>
        <GridElement label="Public Mint Time">
          <input
            type="time"
            defaultValue={new Date().getTime()}
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] px-4"
            placeholder="Input text here"
            {...register("publicMintTime")}
          />
        </GridElement>
      </div>
    </>
  );
}

export default MintDetailsForm;
