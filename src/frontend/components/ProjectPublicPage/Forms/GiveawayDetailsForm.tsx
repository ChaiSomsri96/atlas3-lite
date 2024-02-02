import { RequestCollab } from "@/shared/types";
import React from "react";
import { useFormContext } from "react-hook-form";
import { GridElement, Heading } from "./SharedFormElements";

function GiveawayDetailsForm() {
  const { register } = useFormContext<RequestCollab>();

  return (
    <>
      {/* ----------- Heading -------------------------*/}
      <Heading title="Giveaway Details" description="" />
      <div className="grid grid-cols-2 col-span-2 gap-[10px]">
        <GridElement label="Selection Method">
          <input
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] px-4"
            placeholder="Input text here"
            {...register("selectionMethod")}
          />
        </GridElement>
        <GridElement label="Number of Winners">
          <input
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] px-4"
            placeholder="Input text here"
            type={"number"}
            {...register("numberOfWinners")}
          />
        </GridElement>
        <GridElement label="End Date">
          <input
            type="date"
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] px-4"
            placeholder="Input text here"
            min={1}
            {...register("endDate")}
          />
        </GridElement>
        <GridElement label="End Time">
          <input
            type="time"
            className="text-sm leading-[17px] bg-neutral-800 mt-3 mb-[10px] h-11 border border-neutral-700 rounded-xl py-[14px] px-4"
            placeholder="Input text here"
            {...register("endTime")}
          />
        </GridElement>
      </div>
    </>
  );
}

export default GiveawayDetailsForm;
