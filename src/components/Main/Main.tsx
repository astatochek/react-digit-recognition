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

  const minAccuracyForCache = 0.6;

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

  //               INTERACTION WITH LOCAL STORAGE AFTER USER'S INTERACTION WITH BUTTONS

  /**
   * Sets accuracy at 0 : 0 by default, otherwise - with values from LocalStorage
   */
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

      setAccuracy(() =>
        storedAccuracy.success + storedAccuracy.failure === 0
          ? 0
          : (storedAccuracy.success /
              (storedAccuracy.success + storedAccuracy.failure)) *
            100
      );
    }
  }

  /**
   * Updates `accuracy`'s state and as a LocalStorage item with
   * accordance to the user's evaluation of the prediction
   * @param success
   */
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

  /**
   * Clears LocalStorage, re-initializes accuracy and clears Canvas
   */
  function clearLocalStorage() {
    localStorage.clear();
    initializeAccuracy();
    // console.log("LocalStorage:", localStorage);
    clearCanvas();
  }

  /**
   * Clears Canvas by resetting the PredictionContext to default values
   */
  function clearCanvas() {
    // window.location.reload();
    setPrediction(() => {
      return { ok: false, label: "", data: [] };
    });
  }

  /**
   * Calculates average between the previous average and a new array of pixel values
   * @param input new array of numbers from 0 to 1 of length `sqSize x sqSize`
   * @param base previous average with same characteristics as `input`
   * @param num number of calls for this label
   * @returns new average with same characteristics
   */
  function getAverage(input: number[], base: number[], num: number): number[] {
    if (input.length === 0) return base;
    const nextAverage: number[] = [];
    base.forEach((elem, i) => {
      nextAverage.push((elem * num + input[i]) / (num + 1));
    });
    return nextAverage;
  }

  /**
   * Adds info about previous predictions for this label to LocalStorage or
   * initializes it if there was no info about this label in Cache
   * @param input squeezed pixel data from pending prediction
   * @param label label from pending prediction
   * @param mustMakeRequest true if label from pending prediction was evaluated as wrong by user
   */
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

  /**
   * Called after user's evaluation of the prediction. Calls a
   * function to add info about pending prediction to
   * LocalStorage with reference to the user's evaluation
   * @param isCorrect true if user clicked `Correct`
   */
  function handleUserCheck(isCorrect: boolean) {
    const rawPending = localStorage.getItem("pending");
    if (rawPending) {
      const pending: PendingPrediction = JSON.parse(rawPending);
      if (isCorrect) {
        addItemToLocalStorage(
          pending.squeezed,
          pending.prediction.label,
          !isCorrect
        );
      } else {
        addItemToLocalStorage([], pending.prediction.label, !isCorrect);
      }

      localStorage.removeItem("pending");
      // console.log("LocalStorage:", localStorage);
      updateAccuracy(isCorrect);
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
            <CanvasComponent coefficient={minAccuracyForCache} />
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
              handler={() => {
                handleUserCheck(true);
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center">
            <ButtonComponent
              classNames="border-flamingo-tint-20"
              text="Wrong"
              handler={() => {
                handleUserCheck(false);
              }}
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
