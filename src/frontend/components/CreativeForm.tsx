import { TextArea } from "@/styles/FormComponents";
import { ArrowRight2 } from "iconsax-react";
import React, { useState } from "react";

const CreativeForm: React.FC = () => {
  const [isFinished, setFinished] = useState<boolean>(false);

  const handleNext = () => {
    setFinished(true);
  };

  return (
    <div className="my-16">
      {isFinished ? (
        <div>
          <h1 className="text-2xl text-white font-semibold text-center mb-8">
            Good luck, Negru. You’re going to need it.
          </h1>
          <div className="max-w-[420px] mx-auto">
            <div className="flex flex-col gap-8">
              <button
                type="button"
                className="flex justify-between gap-4 items-center py-8 px-4 border border-primary-700 shadow-sm text-xl font-bold rounded-xl text-white bg-transparent hover:bg-primary-700 text-left"
              >
                <span>Submit application</span>
                <ArrowRight2 size={20} />
              </button>
              <button
                type="button"
                className="py-8 px-4 border border-primary-700 shadow-sm text-xl font-bold rounded-xl text-white bg-transparent hover:bg-primary-700 text-left"
              >
                Save and come back later
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl text-white font-semibold text-center mb-8">
            What is your most creative skill?
          </h1>

          <div className="relative">
            <div className="max-w-[640px] mx-auto">
              <TextArea
                rows={5}
                className="mb-8 border-none hover:ring-none focus:!ring-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23B7B8BA' stroke-width='2' stroke-dasharray='16' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                }}
              />

              <div className="flex justify-center gap-16">
                <button
                  type="button"
                  className="py-2 px-8 border border-primary-500 shadow-sm text-sm font-medium rounded-md text-primary-500 bg-transparent hover:bg-primary-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  className="py-2 px-8 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-700"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreativeForm;
