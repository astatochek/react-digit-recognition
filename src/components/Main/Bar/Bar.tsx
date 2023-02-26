import React from "react";

type Props = {
  score: number;
  length: number;
  label: string;
};

export default function BarComponent({ score, length, label }: Props) {
  return (
    <div className="flex flex-row justify-start items-center my-2 regular-text text-sm">
      <div className="flex flex-col items-start justify-start">
        <div className="h-1 w-32 rounded">
          <div
            style={{ width: `${length}%` }}
            className="h-full rounded bg-gradient-to-r from-purple-400 to-neutrals-light-grey-26"
          ></div>
        </div>
        <div className="text-left">{label}</div>
      </div>

      <div className="pl-4 w-16 text-xs relative top-[-0.6rem] text-white">
        {score.toFixed(3)}
      </div>
    </div>
  );
}
