import React, { useContext } from "react";
import Drawing from "../DrawingComponent/DrawingComponent";
import PredictionContext from "../Context/PredictionContext";

const MainComponent = () => {
  const { num, setNum } = useContext(PredictionContext);

  function clearLocalStorage() {
    localStorage.clear();
    console.log('LocalStorage:', localStorage);
  }

  function refreshPage() {
    window.location.reload();
  }

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-row justify-center m-7">
        <Drawing />
        <div className="border-2 w-60 h-60 text-xl text-center">{num}</div>
      </div>
      <div className="flex flex-row justify-center m-7">
      <button
          className="w-60 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow mx-1"
          onClick={refreshPage}
        >
          Refresh
        </button>
        <button
          className="w-60 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow mx-1"
          onClick={clearLocalStorage}
        >
          Clear Cashe
        </button>
      </div>
    </div>
  );
};

export default MainComponent;
