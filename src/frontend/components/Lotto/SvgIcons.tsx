import { FC } from "react";

interface IconProps {
  className?: string;
  color?: string;
}

export const WalletSmIcon: FC<IconProps> = ({ className, color }) => {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ? className : ""}
    >
      <path
        d="M12.2325 9.38001C12.0925 10.9375 10.9667 11.9583 9.33334 11.9583H4.08334C2.47334 11.9583 1.16667 10.6517 1.16667 9.04167V4.95834C1.16667 3.37167 2.12334 2.26334 3.61084 2.07667C3.76251 2.05334 3.92001 2.04167 4.08334 2.04167H9.33334C9.48501 2.04167 9.63084 2.04751 9.77084 2.07084C11.165 2.23417 12.11 3.20834 12.2325 4.62001C12.25 4.78917 12.11 4.92917 11.9408 4.92917H11.0367C10.4767 4.92917 9.95751 5.145 9.58417 5.53C9.14084 5.96167 8.91917 6.56834 8.97167 7.17501C9.06501 8.23667 9.99834 9.07084 11.1067 9.07084H11.9408C12.11 9.07084 12.25 9.21084 12.2325 9.38001Z"
        fill={color ? color : "#F8FAFC"}
      />
      <path
        d="M12.8333 6.39917V7.60084C12.8333 7.92167 12.5767 8.18417 12.25 8.19584H11.1067C10.4767 8.19584 9.89916 7.735 9.84666 7.105C9.81166 6.7375 9.95166 6.39334 10.1967 6.15417C10.4125 5.9325 10.71 5.80417 11.0367 5.80417H12.25C12.5767 5.81584 12.8333 6.07834 12.8333 6.39917Z"
        fill={color ? color : "#F8FAFC"}
      />
    </svg>
  );
};

export const InfoSmIcon = () => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 11C8.75 11 11 8.75 11 6C11 3.25 8.75 1 6 1C3.25 1 1 3.25 1 6C1 8.75 3.25 11 6 11Z"
        stroke="#F8FAFC"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 4V6.5"
        stroke="#F8FAFC"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.99725 8H6.00174"
        stroke="#F8FAFC"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ToptipArrow = () => {
  return (
    <svg
      width="32"
      height="28"
      viewBox="0 0 32 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_61_13)">
        <path
          d="M16.1392 13L21.9238 5L10.3546 5L16.1392 13Z"
          fill="url(#paint0_linear_61_13)"
        />
        <path
          d="M11.3332 5.5L16.1392 12.1467L20.9453 5.5L11.3332 5.5Z"
          stroke="#66B6F2"
          stroke-opacity="0.4"
        />
      </g>
      <path
        d="M21.9297 5H10.3672L11.7918 7H13H16.5H20.4727L21.9297 5Z"
        fill="#1D2E4D"
      />
      <defs>
        <filter
          id="filter0_d_61_13"
          x="0.354597"
          y="0"
          width="31.5692"
          height="28"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="5" />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.054902 0 0 0 0 0.0705882 0 0 0 0 0.0941176 0 0 0 0.5 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_61_13"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_61_13"
            result="shape"
          />
        </filter>
        <linearGradient
          id="paint0_linear_61_13"
          x1="22.5023"
          y1="11.1357"
          x2="22.0161"
          y2="8.08361"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#1A2E52" />
          <stop offset="1" stopColor="#1D2E4D" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const CircleArrow = () => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.375"
        y="0.375"
        width="11.25"
        height="11.25"
        rx="5.625"
        fill="#1E90FF"
      />
      <path
        d="M5.33334 4L7.33334 6L5.33334 8"
        stroke="#F8FAFC"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="0.375"
        y="0.375"
        width="11.25"
        height="11.25"
        rx="5.625"
        stroke="#1EAEFF"
        strokeWidth="0.75"
      />
    </svg>
  );
};

export const CloseIcon: FC<IconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      className={className ? className : ""}
    >
      <path
        d="M1.5 13.5L13.5 1.5"
        stroke="#0085EA"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 13.5L1.5 1.5"
        stroke="#0085EA"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
