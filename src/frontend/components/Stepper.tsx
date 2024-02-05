import React from "react";
import Image from "next/image";

type Step = {
  steps: string[];
  activeStep: number;
};

const Stepper = ({ steps, activeStep }: Step) => {
  return (
    <div className="grid grid-flow-col gap-3">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`flex flex-col items-center relative
            ${
              index === steps.length - 1
                ? ""
                : `after:absolute after:content-[''] after:border-b-2 ${
                    activeStep > index
                      ? "after:border-primary-500"
                      : "after:border-neutral-200"
                  } after:w-full after:left-[62%] after:top-[28px]`
            }`}
        >
          <div
            className={
              activeStep > index
                ? "w-9 h-9 bg-primary-500 rounded-3xl relative mt-3 z-10"
                : `w-9 h-9 bg-primary-900 rounded-3xl ${
                    activeStep > index - 1
                      ? "border-twitter"
                      : "border-neutral-200"
                  } border-2 relative mt-3 z-10`
            }
          >
            <Image
              src="/images/tick.svg"
              width={16.8}
              height={12}
              className={
                activeStep > index
                  ? "flex justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  : "hidden"
              }
              alt={"tick-icon"}
            />
            {activeStep === index && (
              <div
                className={`absolute w-3 h-3 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-twitter rounded-full`}
              ></div>
            )}
          </div>
          <p className="leading-6 text-neutral-50 text-center">{step}</p>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
