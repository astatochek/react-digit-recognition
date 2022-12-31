import React, { useContext } from "react";
import Drawing from "../DrawingComponent/DrawingComponent";
import PredictionContext from "../Context/PredictionContext";

const MainComponent = () => {
  const { num, setNum } = useContext(PredictionContext);

  return (
    <div>
      <div style={{width: "400px", textAlign: "center"}}>WIP</div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          border: "1px solid black",
          width: "400px",
        }}
      >
        <Drawing />
        <div
          style={{
            fontSize: "170px",
            textAlign: "center",
          }}
        >
          {num}
        </div>
      </div>
    </div>
  );
};

export default MainComponent;
