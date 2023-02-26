import { createContext } from "react";

export type PredictionDataType = {
  ok: boolean;
  label: string;
  data:
    | {
        score: number;
        label: string;
      }[];
};

export class PredictionContextType {
  prediction: PredictionDataType = { ok: false, label: "", data: [] };
  setPrediction: React.Dispatch<React.SetStateAction<PredictionDataType>> =
    () => {};
}

const PredictionContext = createContext<PredictionContextType>(
  new PredictionContextType()
);

export default PredictionContext;
