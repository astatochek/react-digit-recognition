import React from "react";

export default function CorrectButton({ handleCorrect }: any) {
  return (
    <button
      className="w-32 mx-2 text-center focus:outline-none text-white focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 bg-green-600 hover:bg-green-700 focus:ring-green-800"
      onClick={handleCorrect}
    >
      Correct
    </button>
  );
}
