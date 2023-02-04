import React, { useContext, useState, useEffect } from "react";
import Drawing from "../DrawingComponent/DrawingComponent";
import Accuracy from "../AccuracyComponent/Accuracy";
import PredictionContext from "../Context/PredictionContext";

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

      setAccuracy(
        (prev) =>
          (storedAccuracy.success /
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

    setAccuracy(
      (prev) =>
        (storedAccuracy.success /
          (storedAccuracy.success + storedAccuracy.failure)) *
        100
    );
  }

  function clearLocalStorage() {
    localStorage.clear();
    setAccuracy(prev => 0);
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

  function addItemToLocalStorage(input: number[], label: string, mustMakeRequest: boolean) {
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
      addItemToLocalStorage([], pending.label, false);
      localStorage.removeItem("pending");
      console.log("LocalStorage:", localStorage);
      updateAccuracy(false);
      setNum((prev) => "");
    }
  }

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-row justify-center m-7">
        <Drawing coefficient={minAccuracyForCashe} />
        <div className="border-2 w-60 h-60 text-xl text-center">{num}</div>
      </div>

      <div className="flex flex-row justify-center m-2">
        <button
          className="w-32 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow mx-1"
          onClick={refreshPage}
        >
          Refresh
        </button>
        <button
          className="w-32 bg-transparent hover:bg-green-500 text-green-600 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded mx-1"
          onClick={handleCorrect}
        >
          Correct &#10003;
        </button>
        <button
          className="w-32 bg-transparent hover:bg-red-500 text-red-600 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded mx-1"
          onClick={handleWrong}
        >
          Wrong &#215;
        </button>
        <button
          className="w-32 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow mx-1"
          onClick={clearLocalStorage}
        >
          Clear Cashe
        </button>
      </div>

      <div className="w-64 py-4 h-16">
        <Accuracy accuracy={accuracy} coefficient={minAccuracyForCashe} />
      </div>
    </div>
  );
};

export default MainComponent;
