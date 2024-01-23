import Link from "next/link";
import React, { useEffect, useState } from "react";
import { HiSpeakerphone } from "react-icons/hi";

const BottomNotification: React.FC = () => {
  const [isContainerVisible, setIsContainerVisible] = useState(false);

  useEffect(() => {
    const isHidden = localStorage.getItem("meelistbottomNotificationHidden");
    if (!isHidden) {
      setIsContainerVisible(true);
    }
  }, []);

  const closeNotification = () => {
    setIsContainerVisible(false);
    localStorage.setItem("meelistbottomNotificationHidden", "true");
  };

  return isContainerVisible ? (
    <div className="fixed bottom-0 left-0 right-0 mb-4 mx-auto w-11/12 md:w-3/4 bg-gradient-to-r bg-gray-800 p-4 rounded-md shadow-lg flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center">
        <HiSpeakerphone className="h-6 w-6 text-white mr-2" />
        <Link
          href="/meelist"
          target="_blank"
          className="text-md cursor-pointer font-bold text-white mb-2 md:mb-0"
        >
          Applications for a Meegos whitelist spot are now open! Head over to
          the MeeList Applications page to apply.
        </Link>
      </div>
      <button
        className="bg-transparent text-white border border-white px-3 py-1 rounded-md"
        onClick={closeNotification}
      >
        X
      </button>
    </div>
  ) : null;
};

export default BottomNotification;
