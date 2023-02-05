import React, { useState } from "react";
import PredictionContext from "../Context/PredictionContext";
import PopupContext from "../Context/PopupContext";
import MainComponent from "../MainComponent/MainComponent";

const App = () => {
  const [num, setNum] = useState<string>("");
  const [active, setActive] = useState<boolean>(false);

  return (
    <PredictionContext.Provider value={{ num, setNum }}>
      <PopupContext.Provider value={{ active, setActive }}>
        <MainComponent />
      </PopupContext.Provider>
    </PredictionContext.Provider>
  );
};

export default App;
