import React, { useContext } from "react";

interface AccuracyProps {
  accuracy: number;
  coefficient: number;
}

const Accuracy = ({ accuracy, coefficient }: AccuracyProps) => {

  const bgFlag = accuracy < coefficient * 100;

  return (
    <div className="h-2 w-72 bg-gray-300 text-center text-gray-800 font-semibold rounded shadow">
      <div
        style={{ width: `${accuracy}%` }}
        className={`h-full rounded ${
          bgFlag ? "bg-red-700" : "bg-green-700"
        }`}
      ></div>
      <p className="my-2 text-base text-white">Accuracy: {accuracy.toFixed(2)}%</p>
      
    </div>
  );
};

export default Accuracy;
