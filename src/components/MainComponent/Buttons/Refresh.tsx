import React from "react";

export default function RefreshButton({ refreshPage }: any) {
  return (
    <button
      className="w-32 mx-2 border github-base-button"
      onClick={refreshPage}
    >
      Refresh
    </button>
  );
}
