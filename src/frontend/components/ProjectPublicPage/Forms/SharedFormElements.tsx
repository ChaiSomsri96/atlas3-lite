type headingProps = {
  title: string;
  description: string;
};

type subHeadingProps = {
  subHeading: string;
  description: string;
};

type GridElement = {
  label: string;
  children: React.ReactNode;
};

export function Heading({ title, description }: headingProps) {
  return (
    <>
      <h2 className="font-semibold text-[23px] leading-7 -tracking-[0.02em] text-white mt-8">
        {title}
      </h2>
      <h2 className="text-sm leading-[17px] text-neutral-200 mt-1">
        {description}
      </h2>
    </>
  );
}

export function GridElement({ label, children }: GridElement) {
  return (
    <div className="flex flex-col">
      <h2 className="text-lg leading-[22px] text-neutral-50 mt-5">{label}</h2>
      {children}
    </div>
  );
}

export function SubHeading({ subHeading, description }: subHeadingProps) {
  return (
    <>
      <h2 className="font-semibold text-lg leading-[22px] text-neutral-50 mt-1">
        {subHeading}
      </h2>
      <h2 className="text-sm leading-[17px] text-neutral-200 mt-1">
        {description}
      </h2>
    </>
  );
}
