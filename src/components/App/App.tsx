import React, { useState } from "react";
import PredictionContext, {
  PredictionDataType,
} from "../Context/PredictionContext";
import PopupContext from "../Context/PopupContext";
import MainComponent from "../Main/Main";

const App = () => {
  const [prediction, setPrediction] = useState<PredictionDataType>({
    ok: false,
    label: "",
    data: [],
  });
  const [active, setActive] = useState<boolean>(false);

  return (
    <PredictionContext.Provider value={{ prediction, setPrediction }}>
      <PopupContext.Provider value={{ active, setActive }}>
        <MainComponent />
      </PopupContext.Provider>
    </PredictionContext.Provider>
  );
};

export default App;
