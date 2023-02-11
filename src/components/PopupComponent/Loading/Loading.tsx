import React, { useContext, useState, useEffect } from "react";
import "./Loading.css";

const LoadingComonent = () => {
  return (
    <div className="flex justify-center items-center mx-3">
      <div className="animated-block">
        <svg
          id="loading-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
        >
          <path
            d="m53.213 10.786c-11.715-11.715-30.711-11.715-42.426 0-11.716 11.717-11.716 30.71 0 42.427 11.715 11.715 30.711 11.715 42.426 0 11.716-11.717 11.716-30.71 0-42.427m-7.213 42.212l-3.86-4.24c-3.082 1.996-6.623 3.088-10.331 3.088-10.922 0-19.809-9.481-19.809-20.847h7.843c0 7.234 5.368 12.58 11.966 12.58 1.64 0 3.227-.354 4.691-1.016l-3.942-4.33h13.442v14.765m-1.832-21.999c0-6.853-5.36-11.982-11.948-11.982-1.706 0-3.366.357-4.895 1.041l4.207 4.088h-13.532v-13.147l3.456 3.357c3.207-2.084 6.918-3.17 10.764-3.17 10.906 0 19.78 9.041 19.78 19.812h-7.832z"
            fill="#757575"
          />
        </svg>
      </div>
    </div>
  );
};

export default LoadingComonent;