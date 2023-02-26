import React, { useState, useContext, useEffect } from "react";
import PredictionContext from "../../Context/PredictionContext";
import DistributionComponent from "../Distribution/Distribution";
import LoadingComonent from "./Loading/Loading";

export default function PredictionComponent() {
  const [onHover, setOnHover] = useState<boolean>(false);
  const { prediction, setPrediction } = useContext(PredictionContext);

  const isTouchScreenDeviceCheck = () => {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  };

  const isTouchScreenDevice = isTouchScreenDeviceCheck();

  function handleMouseEnter() {
    if (!isTouchScreenDevice)
      setOnHover(() => true);
  }

  function handleMouseLeave() {
    if (!isTouchScreenDevice)
      setOnHover(() => false);
  }

  function handleTouchEvent() {
    if (isTouchScreenDevice) {
      setOnHover((prev) => !prev)
    }
  }

  useEffect(() => {
    setOnHover(() => false);
  }, [prediction.ok])

  return (
    <>
      {prediction.ok ? (
        <div
          className="w-60 h-60 flex page-title justify-center items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchEvent}
        >
          {onHover ? (
            <DistributionComponent distribution={prediction.data}/>
          ) : (
            <div className="text-18xl text-white title-text">
              {prediction.label}
            </div>
          )}
        </div>
      ) : <div className="w-60 h-60"><LoadingComonent /></div>}
    </>
  );
}
