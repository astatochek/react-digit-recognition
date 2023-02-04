import React, { useContext } from "react";

interface AccurcyProps {
  accuracy: number;
  coefficient: number;
}

const Accuracy = (props: AccurcyProps) => {

  const bgFlag = props.accuracy < props.coefficient * 100;

  return (
    <div className="h-2 w-full bg-gray-300 text-center text-gray-800 font-semibold rounded shadow">
      <div
        style={{ width: `${props.accuracy}%` }}
        className={`h-full rounded ${
          bgFlag ? "bg-red-600" : "bg-green-600"
        }`}
      ></div>
      Accuracy: {props.accuracy.toFixed(2)}%
    </div>
  );
};

export default Accuracy;
