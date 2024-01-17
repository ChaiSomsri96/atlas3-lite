import { Dialog, Transition } from "@headlessui/react";
import { CloseSquare } from "iconsax-react";
import { Fragment } from "react";

export const FaqModal = ({
  isModalOpen,
  setModalOpen,
}: {
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
}) => {
  // Sample questions and answers for the modal
  const faqs = [
    {
      question: "Are there any costs?",
      answer:
        "No costs to stake or enter lotteries. A 2% fee is charged only when you withdraw, which goes to the BSL treasury.",
    },
    {
      question: "How do I get started?",
      answer: "Simply stake your $FORGE in Atlas3.",
    },
    {
      question: "How is the lottery pot distributed?",
      answer:
        "Winners are chosen randomly. A larger stake increases your chance and potential share of the pot.",
    },
    {
      question: "How does the jackpot work?",
      answer:
        "The jackpot offers special prizes. There's a small chance for a participant to win. If no one claims the jackpot, the prizes roll over to the next lottery.",
    },
    {
      question: "Is there a catch?",
      answer: "No. The only cost is the 2% withdrawal fee.",
    },
    {
      question: "Can I sponsor some prizes for the lottery?",
      answer:
        "Of course, head over to our Discord and raise a ticket and we can get this sorted for you.",
    },
  ];

  return (
    <div>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setModalOpen(false)}
        >
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as="div"
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-5xl transform rounded-2xl bg-slate-800 p-6 text-left align-middle shadow-xl transition-all border border-primary-500 z-70">
                  <Dialog.Title className="flex justify-between items-center">
                    <h3 className="text-lg font-medium leading-6 text-white">
                      How does the Lossless Lottery work?
                    </h3>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-transparent font-medium text-primary-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setModalOpen(false)}
                    >
                      <CloseSquare size={32} />
                    </button>
                  </Dialog.Title>
                  <div className="mt-2 space-y-6">
                    <p className="text-slate-400">
                      {" "}
                      Stake your $FORGE on Atlas3 to automatically enter all
                      upcoming lotteries. Each lottery features a jackpot with
                      special prizes. If the jackpot isn&apos;t won, the prizes
                      roll over to the next draw, enhancing the potential
                      reward. The more you stake, the better your odds.
                    </p>
                    {faqs.map((faq, idx) => (
                      <div key={idx}>
                        <h4 className="text-white font-medium">
                          {faq.question}
                        </h4>
                        <p className="text-slate-400 mt-2">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg border border-primary-500 bg-transparent px-4 py-3 text-xs font-medium text-primary-500 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};
