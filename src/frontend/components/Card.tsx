import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function Card({ children }: Props) {
  return (
    <div className="w-auto rounded-lg p-5 shadow-lg bg-dark-600">
      {children}
    </div>
  );
}
