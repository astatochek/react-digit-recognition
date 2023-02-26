import React from "react";

type Props = {
  classNames: string;
  text: string;
  handler: (e: any) => void;
};

export default function ButtonComponent({ classNames, text, handler }: Props) {
  return (
    <button
      className={`w-32 py-2 mx-4 border-solid border-2 ${classNames} bg-neutrals-additionals-grey-16 rounded-lg shadow-[0_0_10px_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_10px_2px_rgba(255,255,255,0.2)] ease-out duration-200 p-card-padding-y regular-text text-base`}
      onClick={handler}
    >
      {text}
    </button>
  );
}
