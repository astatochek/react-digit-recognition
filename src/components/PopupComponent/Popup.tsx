import React, { useContext, useState, useEffect } from "react";
import PopupContext from "../Context/PopupContext";
import LoadingComonent from "./Loading/Loading";

const PopupComponent = () => {
  const { active, setActive } = useContext(PopupContext);

  const initialDelay = 30;

  const [delay, setDelay] = useState(initialDelay);

  useEffect(() => {
    const interval = setInterval(() => {
      setDelay((prev) => (prev === 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => setDelay((prev) => initialDelay), [active]);

  return (
    <>
      {active && (
        <div className="h-screen w-screen bg-[rgba(0,0,0,0.7)] fixed left-0 top-0 flex justify-center items-center">
          <div className="w-3/5 p-4 text-center border rounded-lg shadow sm:p-8 bg-white border-gray-200 dark:bg-github-dark-gray dark:border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-center">
              <LoadingComonent />
              <h5 className="mb-2 text-2xl sm:text-4xl font-bold text-gray-800 dark:text-white text-center sm:text-left">
                connecting to{" "}
                <a
                  href="https://huggingface.co/"
                  className="hover:text-blue-500 underline"
                >
                  huggingface.co
                </a>{" "}
                model
              </h5>
            </div>
            <p className="my-3 tetx-xl sm:text-3xl text-gray-400">
              Please wait {delay}s
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PopupComponent;
