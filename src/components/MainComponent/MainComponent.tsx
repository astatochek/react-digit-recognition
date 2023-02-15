import React, { useContext, useState, useEffect } from "react";
import Drawing from "../DrawingComponent/DrawingComponent";
import Accuracy from "../AccuracyComponent/Accuracy";
import PredictionContext from "../Context/PredictionContext";
import PopupComponent from "../PopupComponent/Popup";
import RefreshButton from "./Buttons/Refresh";
import CorrectButton from "./Buttons/Correct";
import WrongButton from "./Buttons/Wrong";
import ClearCasheButton from "./Buttons/ClearCashe";

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
    refreshPage();
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
    <div className="w-full flex items-center justify-center">
      <div className="bg-gray-200 border-gray-300 dark:bg-github-dark-deep border dark:border-gray-200 rounded py-2 sm:py-6 px-4 sm:px-12 m-4 sm:my-12 shadow">
        <div className="flex flex-col sm:flex-row justify-center items-center m-3 sm:m-7">
          <div className="touch-none w-60 h-60 bg-black dark:bg-github-dark-gray border border-gray-900 dark:border-gray-200 max-sm:rounded-t sm:rounded-l">
            <Drawing coefficient={minAccuracyForCashe} />
          </div>
          <div className="w-60 h-60 text-18xl text-white bg-black  dark:bg-github-dark-gray border border-gray-900 dark:border-gray-200 text-center max-sm:rounded-b sm:rounded-r">
            {num}
          </div>
        </div>

        {window.innerWidth >= 640 ? (
          <div className="flex flex-row justify-center m-2">
            <RefreshButton refreshPage={refreshPage} />
            <CorrectButton handleCorrect={handleCorrect} />
            <WrongButton handleWrong={handleWrong} />
            <ClearCasheButton clearLocalStorage={clearLocalStorage} />
          </div>
        ) : (
          <div className="grid grid-cols-2 m-2 [&>*]:m-1">
            <CorrectButton handleCorrect={handleCorrect} />
            <WrongButton handleWrong={handleWrong} />
            <RefreshButton refreshPage={refreshPage} />
            <ClearCasheButton clearLocalStorage={clearLocalStorage} />
          </div>
        )}

        <div className="w-full flex flex-col items-center justify-start mt-6">
          <Accuracy accuracy={accuracy} coefficient={minAccuracyForCashe} />
        </div>

        <PopupComponent />
      </div>
    </div>
  );
};

export default MainComponent;
