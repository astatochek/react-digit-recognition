import React, { useContext, useState, useEffect } from "react";
import PopupContext from "../Context/PopupContext";

const PopupComponent = () => {
  const { active, setActive } = useContext(PopupContext);

  const initialDelay = 20;

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
          <div className="w-3/5 p-4 text-center bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
            <h5 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
              Connecting to{" "}
              <a href="https://huggingface.co/" className="hover:text-blue-500">
                huggingface.co
              </a>
            </h5>
            <p className="my-3 text-3xl text-gray-500 sm:text-lg dark:text-gray-400">
              Please wait {delay}s :)
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PopupComponent;
