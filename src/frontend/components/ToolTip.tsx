import { HiInformationCircle } from "react-icons/hi";

type Props = {
  message: string;
  iconUrl?: string;
};
export default function ToolTip({ message, iconUrl }: Props) {
  return (
    <div className="relative flex flex-col items-center group ">
      {iconUrl ? (
        <img src={iconUrl} alt="" className="w-5 h-5" />
      ) : (
        <HiInformationCircle className="h-5 w-5" aria-hidden="true" />
      )}
      <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
        <span className="relative z-10 p-3 text-xs w-36 text-center leading-none text-white whitespace-no-wrap bg-black shadow-lg">
          {message}
        </span>
        <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
      </div>
    </div>
  );
}
