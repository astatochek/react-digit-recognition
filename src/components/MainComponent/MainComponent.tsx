import React, { useContext } from "react";
import Drawing from "../DrawingComponent/DrawingComponent";
import PredictionContext from "../Context/PredictionContext";

const MainComponent = () => {
  const { num, setNum } = useContext(PredictionContext);

  interface LocalStorageItem {
    average: number[];
    num: number;
  }

  interface PendingPrediction {
    squeezed: number[];
    label: string;
  }

  function clearLocalStorage() {
    localStorage.clear();
    console.log("LocalStorage:", localStorage);
  }

  function refreshPage() {
    window.location.reload();
  }

  function getAverage(input: number[], base: number[], num: number): number[] {
    const nextAverage: number[] = [];
    base.forEach((elem, i) => {
      nextAverage.push((elem + input[i]) / (num + 1));
    });
    return nextAverage;
  }

  function addItemToLocalStorage(input: number[], label: string) {
    const rawItem = localStorage.getItem(label);
    if (rawItem) {
      const item: LocalStorageItem = JSON.parse(rawItem);
      localStorage.setItem(
        label,
        JSON.stringify({
          average: getAverage(input, item.average, item.num),
          num: item.num + 1,
        })
      );
    } else {
      localStorage.setItem(
        label,
        JSON.stringify({
          average: input,
          num: 1,
        })
      );
    }
  }

  function handleCorrect() {
    const rawPending = localStorage.getItem("pending");
    if (rawPending) {
      const pending: PendingPrediction = JSON.parse(rawPending);
      addItemToLocalStorage(pending.squeezed, pending.label);
      localStorage.removeItem("pending");
      console.log("LocalStorage:", localStorage);
      refreshPage();
    }
  }

  function handleWrong() {
    const rawPending = localStorage.getItem("pending");
    if (rawPending) {
      localStorage.removeItem("pending");
      console.log("LocalStorage:", localStorage);
      refreshPage();
    }
  }

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-row justify-center m-7">
        <Drawing />
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
    </div>
  );
};

export default MainComponent;
