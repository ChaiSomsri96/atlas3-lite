import MeeListLayout from "@/frontend/components/Layout/MeeListLayout";
import { Loader } from "@/frontend/components/Loader";
import { MeegosCard } from "@/frontend/components/MeegosCard";
import { MeegosRequirements } from "@/frontend/components/MeegosRequirements";
import { useHandleSaveMeeListAnswer } from "@/frontend/handlers/useHandleSaveMeeListAnswer";
import { useHandleSubmitMeeListApplication } from "@/frontend/handlers/useHandleSubmitMeeList";
import { useGetMeeListApplication } from "@/frontend/hooks/useGetMeelistApplication";
import { Input, TextArea } from "@/styles/FormComponents";
import { ArrowRight2, Headphone, Refresh, TickCircle } from "iconsax-react";
import { useSession } from "next-auth/react";
import { useState, ChangeEvent, useEffect } from "react";

interface IAnswers {
  [key: number]: string;
}

interface IQuestion {
  text: string;
  type: "text" | "number" | "select" | "pill" | "captcha";

  options?: string[];
  rows?: number;
  required: boolean;
  number?: number;
}

export default function MeeList() {
  const [createApplication, setCreateApplication] = useState(false);
  const [completedApplication, setCompletedApplication] = useState(false);
  const [requirementsValidated, setRequirementsValidated] = useState(false);
  const [answers, setAnswers] = useState<IAnswers>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [validationError, setValidationError] = useState(false);
  const handleSaveMeeListAnswer = useHandleSaveMeeListAnswer();
  const handleSubmitMeeList = useHandleSubmitMeeListApplication();
  const { data: ret, isLoading, refetch } = useGetMeeListApplication();

  const captchaImages = [
    "https://assets.editorial.aetnd.com/uploads/2016/11/donald-trump-gettyimages-687193180.jpg",
    "https://media.discordapp.net/attachments/965049093003038810/1126544174586544240/2023-07-06_17.03.31.jpg?width=986&height=1372",
    "https://media.discordapp.net/attachments/965049093003038810/1126545036151103738/image.png?width=1210&height=1144",
    "https://media.discordapp.net/attachments/965049093003038810/1126544175106621512/2023-07-06_17.03.40.jpg?width=1600&height=1200",
    "https://flxt.tmsimg.com/assets/371287_v9_bc.jpg",
    "https://media.discordapp.net/attachments/965049093003038810/1126544174834004009/2023-07-06_17.03.36.jpg?width=710&height=956",
    "https://hips.hearstapps.com/hmg-prod/images/Caitlyn-Jenner_GettyImages-524690236.jpg",
    "https://media.discordapp.net/attachments/965049093003038810/1126545128807485460/image.png?width=954&height=1180",
    "https://media.discordapp.net/attachments/965049093003038810/1126544809495105677/image.png?width=852&height=882",
  ];

  const [answerLoading, setIsAnswerLoading] = useState(false);

  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";

  useEffect(() => {
    if (createApplication) {
      refetch();
    }
  }, [createApplication]);

  const questions: IQuestion[] = [
    {
      text: "What title describes your position in the ecosystem?",
      type: "pill",
      options: [
        "Founder",
        "Artist",
        "Developer",
        "UI/UX Designer",
        "Marketing",
        "Collab Manager",
        "Community Manager",
        "Moderator",
        "Alpha Caller",
        "Influencer",
        "Contributor",
        "Degen",
      ],
      required: true,
    },
    {
      text: "What is your most creative skill?",
      type: "text",
      required: true,
      rows: 4,
    },
    {
      text: "How would you contribute to Meegos as a holder?",
      type: "text",
      required: true,
      rows: 5,
    },
    {
      text: "Nominate up to 3 people to get MeeList",
      type: "text",
      required: false,
      number: 3,
    },
    {
      text: "Links to extra material to support your application, get creative!",
      type: "text",
      required: false,
      rows: 3,
    },
    {
      text: "Select all images with Alex in",
      type: "captcha",
      required: false,
    },
  ];

  const [selectedImages, setSelectedImages] = useState<number[]>([]);

  const handleCaptchaSelection = (index: number) => {
    console.log(index);
    setSelectedImages((prevSelectedImages) => {
      if (prevSelectedImages.includes(index)) {
        return prevSelectedImages.filter((imageIndex) => imageIndex !== index);
      } else {
        return [...prevSelectedImages, index];
      }
    });
  };

  useEffect(() => {
    if (ret && ret.application?.answers) {
      const answersToSet: IAnswers = {};
      for (let i = 0; i < ret.application?.answers.length; i++) {
        answersToSet[i] = ret.application?.answers[i].answer;
      }
      setAnswers(answersToSet);
    }
  }, [ret]);

  const handleAnswer = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    number?: number
  ) => {
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
    } else if (currentQ.number) {
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
  };

  const handleNext = async () => {
    if (validateRequiredFields()) {
      setIsAnswerLoading(true);
      // Save current answer to database
      const answerToSave = {
        question: questions[currentQuestion].text,
        answer: answers[currentQuestion] ?? "",
      };

      await handleSaveMeeListAnswer.mutateAsync({
        answers: [answerToSave],
        showLoading: false,
      });

      setCurrentQuestion(currentQuestion + 1);
      setIsAnswerLoading(false);
      setValidationError(false);

      if (currentQuestion === questions.length - 1) {
        setCompletedApplication(true);
      }
    } else {
      setValidationError(true);
    }
  };

  console.log(selectedImages);

  const handleBack = () => {
    setCurrentQuestion(currentQuestion - 1);
    setValidationError(false);
  };

  const handleSubmit = async () => {
    // Logic for submitting the application

    const answersToSave: { question: string; answer: string }[] = [];

    for (let i = 0; i < questions.length; i++) {
      answersToSave.push({
        question: questions[i].text,
        answer: answers[i] ?? "",
      });
    }

    await handleSubmitMeeList.mutateAsync();

    resetState();
  };

  const resetState = () => {
    // Reset the state and show success message or navigate to the next page
    refetch();
    setAnswers({});
    setCurrentQuestion(0);
    setCreateApplication(false);
    setCompletedApplication(false);
    setRequirementsValidated(false);
  };

  const validateRequiredFields = () => {
    for (let i = 0; i <= currentQuestion; i++) {
      if (questions[i].required && !answers[i]) {
        return false;
      }
    }
    return true;
  };

  const currentQ = questions[currentQuestion];

  if (!session && !sessionLoading) {
    return (
      <MeeListLayout>
        <div className="flex justify-center items-center h-full">
          <div className="flex flex-col justify-center items-center gap-3">
            <p className="text-gray-200 text-2xl font-semibold">
              Please login to view this page.
            </p>
          </div>
        </div>
      </MeeListLayout>
    );
  }

  return (
    <MeeListLayout>
      <div className="">
        {createApplication && !requirementsValidated ? (
          <MeegosRequirements
            setRequirementsValidated={setRequirementsValidated}
          />
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
                        href="https://twitter.com/MeeListed"
                        target="_blank"
                        rel="noreferrer"
                      >
                        @MeeListed.
                      </a>
                    </span>
                  </h1>
                  {/* Add your content here */}
                  <button
                    onClick={handleSubmit}
                    type="button"
                    className="flex w-full mb-2 justify-between gap-4 items-center py-8 px-4 border border-primary-700 shadow-sm text-xl font-bold rounded-xl text-white bg-transparent hover:bg-primary-700 text-left"
                  >
                    <span>Submit application</span>
                    <ArrowRight2 size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetState();
                    }}
                    className="py-8 px-4 w-full border border-primary-700 shadow-sm text-xl font-bold rounded-xl text-white bg-transparent hover:bg-primary-700 text-left"
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
                    <div className="flex flex-col justify-center w-full text-center">
                      {currentQ.type !== "captcha" && (
                        <h1 className="text-xl text-white font-semibold text-center mb-8">
                          {currentQ.text}
                          {currentQ.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h1>
                      )}
                      {currentQ.type === "captcha" && (
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-white p-4 text-black">
                            <div className="flex items-center mb-2">
                              <p>{currentQ.text}</p>
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/RecaptchaLogo.svg/800px-RecaptchaLogo.svg.png"
                                alt="reCAPTCHA Logo"
                                className="h-16 w-16 ml-6"
                              />
                            </div>{" "}
                            <div className="grid grid-cols-3 gap-0 justify-center">
                              {captchaImages.map((image, index) => (
                                <div
                                  key={index}
                                  onClick={() => handleCaptchaSelection(index)}
                                  className={`relative cursor-pointer p-0 flex flex-col items-center justify-center ${
                                    selectedImages.includes(index)
                                      ? "border-primary-500"
                                      : ""
                                  }`}
                                >
                                  <img
                                    src={image}
                                    alt={`Captcha Image ${index}`}
                                    className={`w-32 h-32 ${
                                      selectedImages.includes(index)
                                        ? "border-primary-500"
                                        : ""
                                    }`}
                                  />
                                  {selectedImages.includes(index) && (
                                    <TickCircle
                                      className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                      color="#FFFFFF"
                                      variant="Bold"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-row gap-2 mt-2">
                              <Refresh />
                              <Headphone />
                            </div>
                            <div className="flex text-gray-500 text-xs">
                              Want an easier challenge?
                            </div>
                          </div>
                        </div>
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

                      {currentQ.type === "text" && !currentQ.number && (
                        <TextArea
                          value={String(answers[currentQuestion] || "")}
                          rows={currentQ.rows}
                          onChange={handleAnswer}
                          className="mb-8 border-none hover:ring-none focus:!ring-0"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23B7B8BA' stroke-width='2' stroke-dasharray='16' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
                          }}
                        />
                      )}

                      {currentQ.type === "text" && currentQ.number && (
                        <>
                          <Input
                            value={String(
                              answers[currentQuestion]?.split(", ")[0] || ""
                            )}
                            onChange={(e) => handleAnswer(e, 1)}
                            className="mb-2 border-none focus:ring-transparent"
                            placeholder="@MeegosNFT"
                          />
                          <Input
                            value={String(
                              answers[currentQuestion]?.split(", ")[1] || ""
                            )}
                            onChange={(e) => handleAnswer(e, 2)}
                            className="mb-2 border-none focus:ring-transparent"
                            placeholder="@MeegosNFT"
                          />
                          <Input
                            value={String(
                              answers[currentQuestion]?.split(", ")[2] || ""
                            )}
                            onChange={(e) => handleAnswer(e, 3)}
                            className="mb-2 border-none focus:ring-transparent"
                            placeholder="@MeegosNFT"
                          />
                        </>
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
                            className="flex w-1/2 md:w-1/6 items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700"
                          >
                            Back
                          </button>
                        )}
                        <button
                          onClick={handleNext}
                          className="flex w-1/2 md:w-1/6 items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700"
                        >
                          Next
                        </button>
                      </div>
                      <p className="text-primary-500 text-xs mt-10 text-center">
                        Your application will save as you progress, you can
                        leave this page and come back at any time to continue.
                      </p>
                    </div>
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
                {!createApplication && ret && (
                  <MeegosCard
                    setCreateApplication={setCreateApplication}
                    status={
                      ret && ret.application ? ret.application.status : "none"
                    }
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </MeeListLayout>
  );
}
