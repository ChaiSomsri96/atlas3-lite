import { ApplicationCard } from "@/frontend/components/ApplicationCard";
import { Loader } from "@/frontend/components/Loader";
import { useGetUserApplications } from "@/frontend/hooks/useGetUserApplications";
import { Input, TextArea } from "@/styles/FormComponents";
import { ArrowRight2, TickCircle } from "iconsax-react";
import { useSession } from "next-auth/react";
import { useState, ChangeEvent, useEffect } from "react";
import { ApplicationRequirements } from "@/frontend/components/ApplicationRequirements";
import { useHandleSaveApplicationAnswer } from "@/frontend/handlers/useHandleSaveApplicationAnswer";
import { useHandleSubmitApplication } from "@/frontend/handlers/useHandleSubmitApplication";
import { ExtendedProjectApplication } from "@/pages/api/me/applications";

interface IAnswers {
  [key: number]: string;
}

export default function PendingApplications() {
  const [createApplication, setCreateApplication] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ExtendedProjectApplication | null>();
  const [completedApplication, setCompletedApplication] = useState(false);
  const [requirementsValidated, setRequirementsValidated] = useState(false);
  const [answers, setAnswers] = useState<IAnswers>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [validationError, setValidationError] = useState(false);
  const handleSaveApplicationAnswer = useHandleSaveApplicationAnswer();
  const handleSubmitApplication = useHandleSubmitApplication();
  const { data: ret, isLoading, refetch } = useGetUserApplications();

  const [answerLoading, setIsAnswerLoading] = useState(false);

  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  useEffect(() => {
    if (createApplication) {
      refetch();
    }
  }, [createApplication]);

  useEffect(() => {
    if (selectedApplication && selectedApplication.submissions.length > 0) {
      const answersToSet: IAnswers = {};
      for (
        let i = 0;
        i < selectedApplication.submissions[0].answers.length;
        i++
      ) {
        answersToSet[i] = selectedApplication.submissions[0].answers[i].answer;
      }
      setAnswers(answersToSet);
    }
  }, [selectedApplication]);

  const handleAnswer = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    number?: number
  ) => {
    if (currentQ) {
      const { value } = e.target;
      if (currentQ.type === "pill") {
        const prevAnswers = answers[currentQuestion]
          ? answers[currentQuestion].split(", ")
          : [];
        if (prevAnswers.includes(value)) {
          const index = prevAnswers.indexOf(value);
          if (index > -1) {
            prevAnswers.splice(index, 1);
          }
        } else {
          prevAnswers.push(value);
        }
        setAnswers({ ...answers, [currentQuestion]: prevAnswers.join(", ") });
      } else if (currentQ.textBoxNumber) {
        const prevAnswers = answers[currentQuestion]
          ? answers[currentQuestion].split(", ")
          : [];
        if (number) {
          prevAnswers[number - 1] = value; // Update the specific index
        }
        setAnswers({ ...answers, [currentQuestion]: prevAnswers.join(", ") });
      } else {
        setAnswers({ ...answers, [currentQuestion]: value });
      }
    }
  };

  const handleNext = async () => {
    if (validateRequiredFields() && selectedApplication) {
      setIsAnswerLoading(true);
      // Save current answer to database
      const answerToSave = {
        question: selectedApplication.questions[currentQuestion].text,
        answer: answers[currentQuestion] ?? "",
      };

      await handleSaveApplicationAnswer.mutateAsync({
        answers: [answerToSave],
        showLoading: false,
        id: selectedApplication.id,
      });

      setCurrentQuestion(currentQuestion + 1);
      setIsAnswerLoading(false);
      setValidationError(false);

      if (currentQuestion === selectedApplication.questions.length - 1) {
        setCompletedApplication(true);
      }
    } else {
      setValidationError(true);
    }
  };

  const handleBack = () => {
    setCurrentQuestion(currentQuestion - 1);
    setValidationError(false);
  };

  const handleSubmit = async () => {
    // Logic for submitting the application

    if (selectedApplication) {
      const answersToSave: { question: string; answer: string }[] = [];

      for (let i = 0; i < selectedApplication.questions.length; i++) {
        answersToSave.push({
          question: selectedApplication.questions[i].text,
          answer: answers[i] ?? "",
        });
      }

      await handleSubmitApplication.mutateAsync({
        id: selectedApplication.id,
      });

      resetState();
    }
  };

  const resetState = () => {
    // Reset the state and show success message or navigate to the next page
    refetch();
    setAnswers({});
    setCurrentQuestion(0);
    setCreateApplication(false);
    setCompletedApplication(false);
    setRequirementsValidated(false);
    setSelectedApplication(null);
  };

  const validateRequiredFields = () => {
    if (selectedApplication) {
      for (let i = 0; i <= currentQuestion; i++) {
        if (selectedApplication.questions[i].required && !answers[i]) {
          return false;
        }
      }
      return true;
    }
  };

  const currentQ = selectedApplication?.questions[currentQuestion];

  if (!session && !sessionLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col justify-center items-center gap-3">
          <p className="text-gray-200 text-2xl font-semibold">
            Please login to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {selectedApplication && !requirementsValidated ? (
        <div className="flex flex-col justify-center items-center">
          <ApplicationRequirements
            setRequirementsValidated={setRequirementsValidated}
            application={selectedApplication}
            setSelectedApplication={setSelectedApplication}
          />
        </div>
      ) : requirementsValidated ? (
        <>
          {completedApplication ? (
            <>
              <div className="flex flex-col justify-center text-center items-center">
                <h1 className="text-2xl text-white font-semibold text-center mb-2">
                  Good luck, {session?.user?.name}.
                </h1>
                <h1 className="text-md text-white text-center mb-8">
                  Accepted applications will be posted on{" "}
                  <span className="underline">
                    <a
                      href={`https://twitter.com/${selectedApplication?.twitterUsername}}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      @{selectedApplication?.twitterUsername}.
                    </a>
                  </span>
                </h1>
                {/* Add your content here */}
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="flex w-1/2 mb-2 justify-between gap-4 items-center py-8 px-4 border border-primary-700 shadow-sm text-xl font-bold rounded-xl text-white bg-transparent hover:bg-primary-700 text-left"
                >
                  <span>Submit application</span>
                  <ArrowRight2 size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetState();
                  }}
                  className="py-8 px-4 w-1/2 border border-primary-700 shadow-sm text-xl font-bold rounded-xl text-white bg-transparent hover:bg-primary-700 text-left"
                >
                  Save and come back later
                </button>
              </div>
              <p className="text-orange-500 text-sm mt-10 text-center">
                Note that once the application is submitted, there is no going
                back.
              </p>
            </>
          ) : (
            <>
              {answerLoading ? (
                <Loader />
              ) : (
                <>
                  {currentQ && (
                    <div className="flex flex-col items-center justify-center w-full text-center">
                      {currentQ.type !== "captcha" && (
                        <h1 className="text-xl text-white font-semibold text-center mb-8">
                          {currentQ.text}
                          {currentQ.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h1>
                      )}

                      {currentQ.type === "pill" && (
                        <div className="flex flex-wrap justify-center">
                          {currentQ.options?.map((option, index) => {
                            return (
                              <div
                                key={index}
                                onClick={() =>
                                  handleAnswer({
                                    target: {
                                      value: option,
                                    },
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  } as any)
                                }
                                className={`cursor-pointer m-1 md:w-1/5 sm:w-1/3 w-full text-center inline-flex justify-center items-center gap-2 py-2 px-4 border rounded-full text-sm font-semibold bg-primary-500 text-white border-primary-600`}
                              >
                                {option}
                                {answers[currentQuestion]
                                  ?.split(", ")
                                  .includes(option) && (
                                  <TickCircle
                                    className="h-5 w-5"
                                    color="#FFFFFF"
                                    variant="Bold"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {currentQ.type === "text" && !currentQ.textBoxNumber && (
                        <TextArea
                          value={String(answers[currentQuestion] || "")}
                          rows={currentQ.rows ?? 1}
                          onChange={handleAnswer}
                          className="mb-8 border-none hover:ring-none focus:!ring-0"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23B7B8BA' stroke-width='2' stroke-dasharray='16' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                          }}
                        />
                      )}

                      {currentQ.type === "text" && currentQ.textBoxNumber && (
                        <>
                          <Input
                            value={String(
                              answers[currentQuestion]?.split(", ")[0] || ""
                            )}
                            onChange={(e) => handleAnswer(e, 1)}
                            className="mb-2 border-none focus:ring-transparent"
                            placeholder="@username"
                          />
                          <Input
                            value={String(
                              answers[currentQuestion]?.split(", ")[1] || ""
                            )}
                            onChange={(e) => handleAnswer(e, 2)}
                            className="mb-2 border-none focus:ring-transparent"
                            placeholder="@username"
                          />
                          <Input
                            value={String(
                              answers[currentQuestion]?.split(", ")[2] || ""
                            )}
                            onChange={(e) => handleAnswer(e, 3)}
                            className="mb-2 border-none focus:ring-transparent"
                            placeholder="@username"
                          />
                        </>
                      )}

                      {currentQ.type === "select" && (
                        <select
                          id="type"
                          className={`form-select w-1/2 rounded-md text-sm bg-gray-800 border-gray-700 text-gray-400`}
                          onChange={handleAnswer}
                          value={String(answers[currentQuestion] || "")}
                        >
                          <option value={undefined}>Select One</option>
                          {currentQ.options.map((type) => (
                            <option value={type} key={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      )}

                      {validationError && currentQ.required && (
                        <p className="text-red-500 text-xs mt-1 text-center">
                          Fill in the question bozo.
                        </p>
                      )}
                      <div className="flex flex-row gap-2 mt-5 justify-center">
                        {currentQuestion > 0 && (
                          <button
                            onClick={handleBack}
                            className="flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700"
                          >
                            Back
                          </button>
                        )}
                        <button
                          onClick={handleNext}
                          className="flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700"
                        >
                          Next
                        </button>
                      </div>
                      <p className="text-primary-500 text-xs mt-10 text-center">
                        Your application will save as you progress, you can
                        leave this page and come back at any time to continue.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {!createApplication && ret && ret.applications.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
                  {ret.applications?.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      setSelectedApplication={setSelectedApplication}
                      application={application}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
