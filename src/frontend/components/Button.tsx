type Props = {
  variant?: "outline" | "solid";
  children: React.ReactNode;
  setRCFlow: (x: boolean) => void;
  setIsOpen: (x: boolean) => void;
};

export default function Button({
  variant = "solid",
  children,
  setRCFlow,
  setIsOpen,
}: Props) {
  const outlineVariantStyle =
    "border-[1px] drop-shadow-3xl sm:rounded-xl rounded-lg";
  const solidVariantStyle = "";

  return (
    <button
      className={` bg-transparent text-sm leading-4 sm:w-60 border-primary-500 text-white sm:px-[18px] px-4 sm:py-[15.5px] py-3 ${
        variant === "solid" ? solidVariantStyle : outlineVariantStyle
      }`}
      onClick={() => {
        setRCFlow(true);
        setIsOpen(true);
      }}
    >
      {children}
    </button>
  );
}
