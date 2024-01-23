import { Dialog, Transition } from "@headlessui/react";

import { Fragment } from "react";
import { RxCross2 } from "react-icons/rx";

export type Answers = {
  question: string;
  answer: string;
};

export default function ApplicationAnswersSlideOver({
  open,
  setOpen,
  answers,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  answers: Answers[] | undefined;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-dark-900 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-dark-700 shadow-2xl">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <h2
                          id="slide-over-heading"
                          className="text-xl font-semibold"
                        >
                          Application Answers
                        </h2>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-lg text-primary-500 border-2 p-1 border-primary-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <RxCross2 className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Main */}
                    <div className="mt-3 px-4 sm:px-6">
                      {answers
                        ?.filter(
                          (x) => x.question !== "Select all images with Alex in"
                        )
                        .map((answerItem, index) => (
                          <div key={index}>
                            <h3 className="text-lg font-semibold underline">
                              {answerItem.question}
                            </h3>
                            <div className="mb-5 text-sm">
                              {answerItem.answer}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
