import React, { useContext, useState, useEffect } from "react";
import Drawing from "../DrawingComponent/DrawingComponent";
import Accuracy from "../AccuracyComponent/Accuracy";
import PredictionContext from "../Context/PredictionContext";
import PopupComponent from "../PopupComponent/Popup";

const MainComponent = () => {
  const { num, setNum } = useContext(PredictionContext);

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

  interface PendingPrediction {
    squeezed: number[];
    label: string;
  }

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
      setAccuracy((prev) => 0);
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

    setAccuracy((prev) =>
        storedAccuracy.success + storedAccuracy.failure === 0
          ? 0
          : (storedAccuracy.success /
              (storedAccuracy.success + storedAccuracy.failure)) *
            100
      );
  }

  function clearLocalStorage() {
    localStorage.clear();
    setAccuracy((prev) => 0);
    console.log("LocalStorage:", localStorage);
  }

  function refreshPage() {
    window.location.reload();
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
      addItemToLocalStorage(pending.squeezed, pending.label, false);
      localStorage.removeItem("pending");
      console.log("LocalStorage:", localStorage);
      updateAccuracy(true);
      setNum((prev) => "");
    }
  }

  function handleWrong() {
    const rawPending = localStorage.getItem("pending");
    if (rawPending) {
      const pending: PendingPrediction = JSON.parse(rawPending);
      addItemToLocalStorage([], pending.label, true);
      localStorage.removeItem("pending");
      console.log("LocalStorage:", localStorage);
      updateAccuracy(false);
      setNum((prev) => "");
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="bg-github-dark-deep border border-gray-200 rounded py-6 px-12 my-12">
        <div className="flex flex-row justify-center m-7">
          <div className="w-60 h-60 bg-github-dark-gray border border-gray-200 rounded-l">
            <Drawing coefficient={minAccuracyForCashe} />
          </div>
          <div className="w-60 h-60 text-mega-xl bg-github-dark-gray border border-gray-200 text-center rounded-r">
            {num}
          </div>
        </div>

        <div className="flex flex-row justify-center m-2">
          <button
            className="w-32 mx-2 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            onClick={refreshPage}
          >
            Refresh
          </button>
          <button
            className="w-32 mx-2 text-center focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={handleCorrect}
          >
            Correct
          </button>
          <button
            className="w-32 mx-2 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            onClick={handleWrong}
          >
            Wrong
          </button>
          <button
            className="w-32 mx-2 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            onClick={clearLocalStorage}
          >
            Clear Cashe
          </button>
        </div>

        <div className="w-full py-4 h-16 flex items-center justify-center">
          <Accuracy accuracy={accuracy} coefficient={minAccuracyForCashe} />
        </div>

        <PopupComponent />
      </div>
    </div>
  );
};

export default MainComponent;
