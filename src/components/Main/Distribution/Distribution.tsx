import React from "react";
import BarComponent from "../Bar/Bar";

type Props = {
  distribution: { score: number; label: string }[];
};

export default function DictributionComponent({ distribution }: Props) {
  const max = Math.max.apply(
    null,
    distribution.map(({ score, label }) => score)
  );
  return (
    <div className="p-8 flex flex-col justify-start items-center">
      {distribution.map(({ score, label }) => (
        <BarComponent
          key={label}
          score={score}
          length={(score / max) * 100}
          label={label}
        />
      ))}
    </div>
  );
}
