import { InfoCircle } from "iconsax-react";
import { useState } from "react";
import { ManagePointsModal } from "./ManagePointsModal";

type Props = {
  points: number | undefined;
  refetch: () => void;
  screen: "listings" | "buys" | "mylistings" | "activity" | "presales";
};

export const PointsBox = ({ points, refetch, screen }: Props) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  let screenText = "";
  switch (screen) {
    case "listings":
      screenText =
        "View available allowlists for sale here. Upon purchase, Atlas3 submissions and associated Discord roles transfer from seller to buyer.";
      break;
    case "buys":
      screenText =
        "View allowlist buy orders; sell yours if an order meets your requirements.";
      break;
    case "mylistings":
      screenText = "View your sell and buy orders here.";
      break;
    case "activity":
      screenText = "View all the activity on the allowlist marketplace.";
      break;
    case "presales":
      screenText = "View all the presales you have entered.";
      break;
  }
  return (
    <div className="bg-primary-900 px-6 py-4 flex flex-col md:flex-row gap-4 rounded-xl mt-6">
      <InfoCircle className="w-6 h-6 self-start md:self-center" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
        <div className="order-2 md:order-none">
          <p className="text-sm text-white max-w-4xl mt-1">{screenText}</p>
        </div>
        <div
          className="order-1 md:order-none mb-2 md:mb-0 cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          <div className="border border-primary-500 rounded-md bg-dark-700 py-1 px-3 flex items-center text-center">
            <img
              src="/images/Atlas3Points.png"
              className="w-5 h-5 mr-2"
              alt="Points"
            />
            <span className="text-md font-semibold text-white">
              {(points ?? 0) / 1000} Points
            </span>
            <div
              className="border-l border-white mx-2 h-4"
              style={{ borderWidth: "0.5px" }}
            ></div>
            <img src="/images/plusicon.svg" alt="plus" className="h-5 " />{" "}
          </div>
        </div>
      </div>
      <ManagePointsModal
        currentPoints={(points ?? 0) / 1000}
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        refetch={refetch}
      />
    </div>
  );
};
