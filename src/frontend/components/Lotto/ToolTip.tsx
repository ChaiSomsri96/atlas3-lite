import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import { ToptipArrow } from "./SvgIcons";

interface Props {
  title?: string;
  children?: ReactNode;
}

const ToolTip: FC<Props> = ({ title, children }) => {
  const childrenRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
  });
  useEffect(() => {
    const getPosition = () => {
      if (childrenRef.current) {
        const { left, top, width } =
          childrenRef.current.getBoundingClientRect();
        setPosition({
          left,
          top,
          width,
        });
      }
    };

    getPosition();

    window.addEventListener("scroll", getPosition);
    window.addEventListener("resize", getPosition);

    return () => {
      window.removeEventListener("scroll", getPosition);
      window.removeEventListener("resize", getPosition);
    };
  }, [childrenRef]);
  return (
    <>
      <div ref={childrenRef} className="group">
        {children}
        <div
          className="rounded-xl border border-[#66b6f266] bg-tooltip py-2 px-6 text-[12px] w-[160px] z-[500] fixed hidden group-hover:block"
          style={{
            left: position.left,
            marginLeft: position.width / 2,
            top: position.top - 5,
            zIndex: 999,
            transform: `translate(${
              position.left > 90 ? "-50%" : "-24px"
            }, -100%)`,
          }}
        >
          <span
            className="absolute -bottom-[22px] z-10 -translate-x-1/2"
            style={{
              left: 
                position.left > 90 ? "50%" : "24px"
            }}
          >
            <ToptipArrow />
          </span>
          <span className="relative z-30 leading-[1.2]">{title}</span>
        </div>
      </div>
    </>
  );
};

export default ToolTip;
