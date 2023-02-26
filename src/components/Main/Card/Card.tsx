import React from "react";

type Props = {
  border: string;
  children: string | JSX.Element | JSX.Element[];
};

export default function CardComponent({ border, children }: Props) {
  return (
    <div className={`p-1 border-2 m-4 sm:m-8 touch-none select-none ${border} bg-neutrals-light-grey-26 rounded-lg shadow-md`}>
      {children}
    </div>
  );
}
