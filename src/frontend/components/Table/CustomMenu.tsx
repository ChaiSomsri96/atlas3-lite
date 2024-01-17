import { Menu } from "@headlessui/react";
import { More } from "iconsax-react";
import { FC, ReactNode, useEffect, useState } from "react";

export const CustomMenu: FC<{
  children: ReactNode;
  handleMenuOpen: (isOpen: boolean) => void;
}> = ({ children, handleMenuOpen }) => {
  const [internalOpen, setInternalOpen] = useState(false);

  function handleOpenChange(open: boolean) {
    setInternalOpen(open);
  }

  useEffect(() => {
    handleMenuOpen(internalOpen);
  }, [internalOpen, handleMenuOpen]);

  return (
    <Menu>
      {({ open }) => {
        handleOpenChange(open);

        return (
          <div className="relative text-left">
            <Menu.Button className="inline-flex w-full justify-center rounded-md bg-transparent border border-primary-500 p-1 text-twitter">
              <More size={16} />
            </Menu.Button>
            {internalOpen && children}
          </div>
        );
      }}
    </Menu>
  );
};
