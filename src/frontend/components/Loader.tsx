import { RiLoader3Fill } from "react-icons/ri";

export const Loader = () => {
  return (
    <div className="flex justify-center items-center h-24 mt-6">
      <RiLoader3Fill className="h-12 w-12 text-primary-500 animate-spin" />
    </div>
  );
};
