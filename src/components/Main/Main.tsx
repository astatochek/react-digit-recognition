import React, { useContext, useState, useEffect } from "react";
import CanvasComponent from "../Canvas/Canvas";
import PredictionContext, {
  PredictionDataType,
} from "../Context/PredictionContext";
import CardComponent from "./Card/Card";
import PredictionComponent from "./Prediction/Prediction";
import ButtonComponent from "./Button/Button";

const MainComponent = () => {
  const { prediction, setPrediction } = useContext(PredictionContext);

  interface LocalStorageItem {
    average: number[];
    num: number;
    mustMakeRequest: boolean;
  }

  const minAccuracyForCashe = 0.6;

  interface AccuracyData {
    success: number;
    failure: number;
  }

  type PendingPrediction = {
    squeezed: number[];
    prediction: PredictionDataType;
  };

  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    initializeAccuracy();
  }, [accuracy]);

  function initializeAccuracy() {
    if (!localStorage.getItem("accuracy")) {
      localStorage.setItem(
        "accuracy",
        JSON.stringify({
          success: 0,
          failure: 0,
        })
      );
      setAccuracy(() => 0);
    } else {
      const storedAccuracy: AccuracyData = JSON.parse(
        localStorage.getItem("accuracy") || ""
      );

      setAccuracy((prev) =>
        storedAccuracy.success + storedAccuracy.failure === 0
          ? 0
          : (storedAccuracy.success /
              (storedAccuracy.success + storedAccuracy.failure)) *
            100
      );
    }
  }

  function updateAccuracy(success: boolean) {
    initializeAccuracy();

    const storedAccuracy: AccuracyData = JSON.parse(
      localStorage.getItem("accuracy") || ""
    );

    if (success) {
      storedAccuracy.success++;
    } else {
      storedAccuracy.failure++;
    }

    localStorage.setItem("accuracy", JSON.stringify(storedAccuracy));

    setAccuracy(() =>
      storedAccuracy.success + storedAccuracy.failure === 0
        ? 0
        : (storedAccuracy.success /
            (storedAccuracy.success + storedAccuracy.failure)) *
          100
    );
  }

  function clearLocalStorage() {
    localStorage.clear();
    initializeAccuracy();
    console.log("LocalStorage:", localStorage);
    clearCanvas();
  }

  function clearCanvas() {
    // window.location.reload();
    setPrediction(() => {
      return { ok: false, label: "", data: [] };
    });
  }

  function getAverage(input: number[], base: number[], num: number): number[] {
    if (input.length === 0) return base;
    const nextAverage: number[] = [];
    base.forEach((elem, i) => {
      nextAverage.push((elem * num + input[i]) / (num + 1));
    });
    return nextAverage;
  }

  function addItemToLocalStorage(
    input: number[],
    label: string,
    mustMakeRequest: boolean
  ) {
    const rawItem = localStorage.getItem(label);
    if (rawItem) {
      const item: LocalStorageItem = JSON.parse(rawItem);
      localStorage.setItem(
        label,
        JSON.stringify({
          average: getAverage(input, item.average, item.num),
          num: item.num + 1,
          mustMakeRequest: mustMakeRequest,
        })
      );
    } else {
      localStorage.setItem(
        label,
        JSON.stringify({
          average: input,
          num: 1,
          mustMakeRequest: mustMakeRequest,
        })
      );
    }
  }

  function handleCorrect() {
    const rawPending = localStorage.getItem("pending");
    if (rawPending) {
      const pending: PendingPrediction = JSON.parse(rawPending);
      addItemToLocalStorage(pending.squeezed, pending.prediction.label, false);
      localStorage.removeItem("pending");
      console.log("LocalStorage:", localStorage);
      updateAccuracy(true);
      setPrediction(() => {
        return { ok: false, label: "", data: [] };
      });
    }
  }

  function handleWrong() {
    const rawPending = localStorage.getItem("pending");
    if (rawPending) {
      const pending: PendingPrediction = JSON.parse(rawPending);
      addItemToLocalStorage([], pending.prediction.label, true);
      localStorage.removeItem("pending");
      console.log("LocalStorage:", localStorage);
      updateAccuracy(false);
      setPrediction(() => {
        return { ok: false, label: "", data: [] };
      });
    }
  }

  return (
    <div className="overflow-hidden relative main-container">
      <div className="radial-gradient-magenta-tint-20 top-[-1032px] left-[-101px] md:top-[-746px] md:left-[-130px]"></div>
      <div className="w-full flex flex-col items-center justify-center pt-5 sm:pt-20 px-20 relative">
        <div className="title-text text-3xl sm:text-7xl">
          React-Digit-Recognition
        </div>
        <div className="flex flex-col sm:flex-row items-stretch">
          <CardComponent border="border-magenta-tint-10">
            <CanvasComponent coefficient={minAccuracyForCashe} />
          </CardComponent>
          <CardComponent border="border-brand-purple-tint-20">
            <PredictionComponent />
          </CardComponent>
        </div>
        <div className="flex flex-row justify-center items-center">
          <div className="flex flex-col-reverse sm:flex-row justify-center items-center">
          <ButtonComponent
            classNames="border-magenta-tint-10"
            text="Clear Canvas"
            handler={clearCanvas}
          />
          <ButtonComponent
            classNames="border-cyan-tint-20"
            text="Correct"
            handler={handleCorrect}
          />
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center">
          <ButtonComponent
            classNames="border-flamingo-tint-20"
            text="Wrong"
            handler={handleWrong}
          />
          <ButtonComponent
            classNames="border-brand-purple-tint-20"
            text="Clear Cache"
            handler={clearLocalStorage}
          />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainComponent;
