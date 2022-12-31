import React, { useState } from "react";
import PredictionContext from "../Context/PredictionContext";
import MainComponent from "../MainComponent/MainComponent";

const App = () => {
  const [num, setNum] = useState<string>("");
  return (
    <PredictionContext.Provider value={{ num, setNum }}>
      <MainComponent />
    </PredictionContext.Provider>
  );
};

export default App;
