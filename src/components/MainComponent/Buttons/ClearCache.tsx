import React from "react";

export default function ClearCasheButton({ clearLocalStorage }: any) {
  return (
    <button
      className="w-32 mx-2 github-base-button"
      onClick={clearLocalStorage}
    >
      Clear Cashe
    </button>
  );
}
