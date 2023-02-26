import React, { useState, useRef, useContext, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import PredictionContext, {
  PredictionDataType,
} from "../Context/PredictionContext";
import PopupContext from "../Context/PopupContext";

interface DrawingProps {
  coefficient: number;
}

export default function CanvasComponent(props: DrawingProps) {
  class Point {
    points: number[] = [];
  }

  interface AccuracyData {
    success: number;
    failure: number;
  }

  interface LocalStorageItem {
    average: number[];
    num: number;
    mustMakeRequest: boolean;
  }

  const sqSize = 24; // Squeezed Size
  const labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const [lines, setLines] = useState<Point[]>([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const { prediction, setPrediction } = useContext(PredictionContext);

  const remSize = 60;
  const size = Math.floor(
    (parseInt(getComputedStyle(document.documentElement).fontSize) * remSize) /
      4
  );

  // Clears Canvas if prediction in not defined
  useEffect(() => {
    if (stageRef.current && !prediction.ok) {
      const layers = stageRef.current.getChildren();
      layers.forEach((layer) => layer.destroyChildren());
    }
  }, [prediction]);

  //                           HANDLE CANVAS INFO AND MAKE PREDICTION(S)

  /**
   * Requests a prediction from huggingface.co
   * @param data body of the request
   * @param sqData argument for a `handleResolvedPrediction` function called when resolved
   */
  async function getPrediction(data: any, sqData: number[]) {
    const res = await fetch(
      "https://api-inference.huggingface.co/models/farleyknight-org-username/vit-base-mnist",
      {
        headers: {
          Authorization: "Bearer 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",
        },
        method: "POST",
        body: data,
      }
    );

    if (!res.ok) {
      setTimeout(() => {
        getPrediction(data, sqData);
      }, 1000);
    } else {
      const body = await res.json();
      // console.log("Response Data:");
      // console.table(body);
      handleResolvedPrediction(body, sqData);
    }
  }

  /**
   * Compares giver array with size `sqSize x sqSize` with cached averages,
   * stored in LocalStorage with labels as `key` and type `LocalStorageItem`
   * @param input squeezed array to compare with cached averages
   * @returns prediction as in `PredictionContext`
   */
  function compareWithCashed(input: number[]): PredictionDataType {
    let threshold = 1e-247; // :)
    let numOfCached = 0;
    let distances: number[] = []; // length = 10
    // console.log("Started Calculating Distances");
    labels.forEach((label) => {
      const rawItem = localStorage.getItem(label);
      if (rawItem) {
        const item: LocalStorageItem = JSON.parse(rawItem);
        // console.log("Label:", label, "Item:", item);
        distances.push(getDistance(input, item.average));
        numOfCached++;
      } else {
        distances.push(sqSize * sqSize);
      }
    });

    if (numOfCached === labels.length) {
      threshold = 0.1;
    }

    // console.log("Finished Calculating Distances");
    // console.log("Raw Distances", distances);

    let sum = 0;
    distances.forEach((elem) => {
      sum += Math.exp(elem);
    });

    distances = distances.map((elem) => Math.exp(elem) / sum);

    // console.log("Distances as Probability Values:", distances);

    const fastPrediction = distances.indexOf(Math.min(...distances));

    const storedAccuracy: AccuracyData = JSON.parse(
      localStorage.getItem("accuracy") || ""
    );
    const successCoefficient =
      storedAccuracy.success + storedAccuracy.failure === 0
        ? 0
        : storedAccuracy.success /
          (storedAccuracy.success + storedAccuracy.failure);

    // console.table(storedAccuracy);

    if (localStorage.getItem(labels[fastPrediction])) {
      const item: LocalStorageItem = JSON.parse(
        localStorage.getItem(labels[fastPrediction]) || ""
      );
      if (item.mustMakeRequest) return { ok: false, label: "", data: [] };
    }

    if (
      distances[fastPrediction] <= threshold &&
      successCoefficient > props.coefficient
    ) {
      // console.log(
      //   `Threshold Passed: ${distances[fastPrediction]} <= ${threshold}`
      // );
      const res = preparePredictionFromDistances(distances);
      // console.log("Cached Prediction Data:");
      // console.table(res.data);
      return res;
    }

    return { ok: false, label: "", data: [] };
  }

  /**
   * Squeezes an array `data` from canvas data to an array of specified length
   * @param data special type of array, used to store pixel info in canvas
   * @param size size of canvas in pixels (calculated from `rem` value)
   * @param sqSize square root of squeezed array
   * @returns array of size `sqData x sqData`
   */
  function squeeze(
    data: Uint8ClampedArray,
    size: number,
    sqSize: number
  ): number[] {
    const matrix: number[][] = [];
    let buffer: number[] = [];
    data.forEach((elem, i) => {
      if (i % 4 === 0) {
        if (i % (4 * size) === 0) {
          if (buffer.length !== 0) matrix.push([...buffer]);
          buffer = [];
        }
        buffer.push(elem / 256);
      }
    });
    matrix.push(buffer);
    buffer = [];

    const step = Math.floor(size / sqSize);

    const res: number[] = [];

    for (let i = 0; i < sqSize; i++) {
      for (let j = 0; j < sqSize; j++) {
        let sum = 0;
        const rowStart = Math.floor((i * size) / sqSize);
        const colStart = Math.floor((j * size) / sqSize);
        for (let k = rowStart; k < rowStart + step; k++) {
          for (let l = colStart; l < colStart + step; l++) {
            sum += matrix[k][l];
          }
        }
        res.push(sum / (step * step));
      }
    }

    return res;
  }

  /**
   * Calculates Euclidean distance between 2 arrays of same length
   * @param a array of numbers from 0 to 1 of length: `sqSize x sqSize`
   * @param b same as `a`
   * @returns a number from 0 to `sqSize x sqSize` (for some reason...)
   */
  function getDistance(a: number[], b: number[]) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    if (Number.isNaN(sum)) {
      return sqSize;
    }
    return Math.sqrt(sum);
  }

  /**
   * From calculated using Cache distances prepares top-5 predictions if possible
   * @param distances array of numbers from 0 to 1 of length `sqSize x sqSize`
   * @param length (5 by default) length of output array
   * @returns object of type PredictionDataType, containing status, final prediction and top-5
   */
  function preparePredictionFromDistances(
    distances: number[],
    length: number = 5
  ): PredictionDataType {
    try {
      let distancesWithLabels = distances.map((distance, i) => {
        const elem = { score: distance, label: `${i}` };
        return elem;
      });

      distancesWithLabels = distancesWithLabels.sort(
        (a, b) => a.score - b.score
      );
      distancesWithLabels = distancesWithLabels.slice(0, length);

      let sum = 0;
      distancesWithLabels.forEach(({ score }) => {
        sum += 1 / score;
      });

      distancesWithLabels = distancesWithLabels.map(({ score, label }) => {
        return { score: 1 / score / sum, label: label };
      });

      return {
        ok: true,
        label: distancesWithLabels[0].label,
        data: distancesWithLabels,
      };
    } catch (e) {
      console.error(e);
      return { ok: false, label: "", data: [] };
    }
  }

  /**
   * Gets info from canvas, prepares squeezed array of pixel data,
   * makes a fast prediction using Cached data, calls function to
   * make request to `huggingface.co` if fast predictions is considered
   * invalid; sets up loading spinner.
   */
  const handleExport = async () => {
    setActive(() => true);
    if (stageRef.current) {
      const blob = await stageRef.current.toBlob();
      const ctx = stageRef.current?.toCanvas().getContext("2d");
      if (ctx) {
        const data = ctx.getImageData(0, 0, size, size).data;
        const sqData = squeeze(data, size, sqSize);
        const fastPrediction = compareWithCashed(sqData);
        if (fastPrediction.ok) {
          handleResolvedPrediction(fastPrediction.data, sqData);
        } else {
          getPrediction(blob, sqData);
        }
      }
    }
  };

  /**
   * From top-5 predictions and squeezed array of pixel data
   * deactivates loading spinner, updates PredictionContext and
   * sets new prediction as `pending` for user to respond
   * @param prediction array of top-5 predictions
   * @param sqData squeezed array of pixel data from canvas
   */
  function handleResolvedPrediction(
    prediction: { score: number; label: string }[],
    sqData: number[]
  ) {
    const newPrediction = {
      ok: true,
      label: prediction[0].label,
      data: prediction,
    };
    setActive(() => false);
    setPrediction(() => newPrediction);
    localStorage.setItem(
      "pending",
      JSON.stringify({
        squeezed: sqData,
        prediction: newPrediction,
      })
    );
  }

  //                                HANDLE INTERACTIONS WITH CANVAS

  /**
   * Checks if the device is Touch Screen type
   * @returns `true` if that is the case
   */
  const isTouchScreenDeviceCheck = () => {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  };

  const isTouchScreenDevice = isTouchScreenDeviceCheck();

  /**
   * Prevents the redundant call of `startDrawing`
   * @param e event object
   */
  const handleMouseDown = (e: any) => {
    if (!isTouchScreenDevice) startDrawing(e);
  };

  /**
   * Permits further interaction with Canvas, draws the currents position of the pointer
   * @param e event object
   */
  const startDrawing = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  /**
   * Prevents the redundant call of `continueDrawing`
   * @param e event object
   */
  const handleMouseMove = (e: any) => {
    if (!isTouchScreenDevice) continueDrawing(e);
  };

  /**
   * If interaction with Canvas is permitted draws the current pinter
   * position and a line, connecting it with the previous one
   * @param e event object
   * @returns
   */
  const continueDrawing = (e: any) => {

    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];

    lastLine.points = lastLine.points.concat([point.x, point.y]);

    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  /**
   * Prevents the redundant call of `finishDrawing`
   */
  const handleMouseUp = () => {
    if (!isTouchScreenDevice) finishDrawing();
  };

  /**
   * Prohibits further interaction with Canvas;
   * calls `handleExport` to get the pixel data
   * from Canvas and make prediction(s)
   */
  const finishDrawing = () => {
    isDrawing.current = false;
    handleExport();
  };

  const { active, setActive } = useContext(PopupContext);

  return (
    <>
      <Stage
        width={size}
        height={size}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={startDrawing}
        onTouchMove={continueDrawing}
        onTouchEnd={finishDrawing}
        ref={stageRef}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="white"
              strokeWidth={size / 10}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation="source-over"
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
};
