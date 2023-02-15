import React, { useContext } from "react";

interface AccuracyProps {
  accuracy: number;
  coefficient: number;
}

const Accuracy = ({ accuracy, coefficient }: AccuracyProps) => {
  const bgFlag = accuracy < coefficient * 100;

  return (
    <>
      <div className="h-2 w-72 bg-gray-300 text-center text-gray-800 font-semibold rounded shadow">
        <div
          style={{ width: `${accuracy}%` }}
          className={`h-full rounded ${bgFlag ? "bg-red-700" : "bg-green-700"}`}
        ></div>
      </div>
      <div className="my-2 text-base text-gray-900 dark:text-white">
        Accuracy: {accuracy.toFixed(2)}%
      </div>
    </>
  );
};

export default Accuracy;
