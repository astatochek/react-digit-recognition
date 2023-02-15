import React from "react";

export default function WrongButton({ handleWrong }: any) {
  return (
    <button
      className="w-32 mx-2 focus:outline-none text-white focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 bg-red-600 hover:bg-red-700 focus:ring-red-900"
      onClick={handleWrong}
    >
      Wrong
    </button>
  );
}
