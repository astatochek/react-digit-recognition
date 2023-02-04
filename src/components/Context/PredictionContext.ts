import { createContext } from "react";

export class PredictionContextType {
  num: string = "";
  setNum: React.Dispatch<React.SetStateAction<string>> = () => {};
}

const PredictionContext = createContext<PredictionContextType>(
  new PredictionContextType()
);

export default PredictionContext;
