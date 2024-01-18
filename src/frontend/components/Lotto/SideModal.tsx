import { FC, ReactNode, useEffect } from "react";
import { CloseIcon } from "./SvgIcons";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}

const SideModal: FC<ModalProps> = ({ isOpen, title, onClose, children }) => {
  const handleClose = () => {
    document.body.style.overflow = "auto";
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div
      className="w-screen h-screen fixed left-0 top-0 z-[500]"
      style={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "all" : "none",
      }}
    >
      <div
        className="opacity-60 bg-[#0E1218] absolute left-0 top-0 h-full w-full z-10"
        onClick={handleClose}
      />
      <div
        className="w-full md:w-[570px] h-full absolute right-0 top-0 bg-neutral-900 z-20 py-10 pl-6 duration-300"
        style={{
          boxShadow: "-20px 0px 50px 0px rgba(0, 0, 0, 0.50)",
          transform: `translateX(${isOpen ? 0 : "100%"})`,
        }}
      >
        <div className="flex items-center justify-between pr-6">
          <h2 className="text-[23px] font-semibold leading-7 -tracking-[0.46px]">
            {title}
          </h2>
          <button
            className="w-12 h-12 border border-primary-500 rounded-xl grid place-content-center group"
            onClick={handleClose}
          >
            <CloseIcon className="group-hover:rotate-90 duration-200" />
          </button>
        </div>
        <div className="mt-8 h-[calc(100vh-140px)] overflow-auto sidebar-scroll pr-4 mr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SideModal;
