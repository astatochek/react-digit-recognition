import React, { useState, useContext } from "react";
import PredictionContext from "../../Context/PredictionContext";
import DistributionComponent from "../Distribution/Distribution";
import { PredictionDataType } from "../../Context/PredictionContext";

export default function PredictionComponent() {
  const [onHover, setOnHover] = useState<boolean>(false);
  const { prediction, setPrediction } = useContext(PredictionContext);

  function handleMouseEnter() {
    setOnHover(() => true);
  }

  function handleMouseLeave() {
    setOnHover(() => false);
  }

  return (
    <>
      {prediction.ok ? (
        <div
          className="w-60 h-60 flex page-title justify-center items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {onHover ? (
            <DistributionComponent distribution={prediction.data}/>
          ) : (
            <div className="text-18xl text-white title-text">
              {prediction.label}
            </div>
          )}
        </div>
      ) : <div className="w-60 h-60"></div>}
    </>
  );
}
