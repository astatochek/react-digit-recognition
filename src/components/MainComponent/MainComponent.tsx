import React, { useContext } from "react";
import Drawing from "../DrawingComponent/DrawingComponent";
import PredictionContext from "../Context/PredictionContext";

const MainComponent = () => {
  const { num, setNum } = useContext(PredictionContext);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row justify-center m-7">
        <Drawing />
        <div className="border-2 w-60 h-60 text-xl text-center">{num}</div>
      </div>
    </div>
  );
};

export default MainComponent;
