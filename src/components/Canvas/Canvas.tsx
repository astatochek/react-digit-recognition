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

const Drawing = (props: DrawingProps) => {
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
        setActive(() => true);
        getPrediction(data, sqData);
      }, 1000);
    } else {
      const body = await res.json();
      console.log("Response Data:");
      console.table(body);
      setActive(() => false);
      handleResolvedPrediction(body, sqData);
    }
  }

  /**
   * Compares giver array with size `sqSize x sqSize` with cached averages,
   * stored in LocalStorage with lebels as `key` and type `LocalStorageItem`
   * @param input squeezed array to compare with cached averages
   * @returns prediction as in `PredictionContext`
   */
  function compareWithCashed(input: number[]): PredictionDataType {
    let threshold = 1e-247; // :)
    let numOfCached = 0;
    let distances: number[] = []; // length = 10
    console.log("Started Calculating Distances");
    labels.forEach((label) => {
      const rawItem = localStorage.getItem(label);
      if (rawItem) {
        const item: LocalStorageItem = JSON.parse(rawItem);
        console.log("Label:", label, "Item:", item);
        distances.push(getDistance(input, item.average));
        numOfCached++;
      } else {
        distances.push(sqSize * sqSize);
      }
    });

    if (numOfCached === labels.length) {
      threshold = 0.1;
    }

    console.log("Finished Calculating Distances");
    console.log("Raw Distances", distances);

    let sum = 0;
    distances.forEach((elem) => {
      sum += Math.exp(elem);
    });

    distances = distances.map((elem) => Math.exp(elem) / sum);

    console.log("Simplexed Distances:", distances);

    const fastPrediction = distances.indexOf(Math.min(...distances));

    // console.log("LocalStorage:", localStorage);

    const storedAccuracy: AccuracyData = JSON.parse(
      localStorage.getItem("accuracy") || ""
    );
    const successCoefficient =
      storedAccuracy.success + storedAccuracy.failure === 0
        ? 0
        : storedAccuracy.success /
          (storedAccuracy.success + storedAccuracy.failure);

    console.table(storedAccuracy);

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
      console.log(`Threshold Passed: ${distances[fastPrediction]} <= ${threshold}`);
      const res = preparePredictionFromDistances(distances);
      console.log("Cached Prediction Data:");
      console.table(res.data);
      return res;
    }

    return { ok: false, label: "", data: [] };
  }

  const isTouchScreenDevice = () => {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  };

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
    // console.log(matrix);

    const step = Math.floor(size / sqSize);

    // matrix.forEach((line, i) => console.log(i, line));

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
        // console.log(sum);
        res.push(sum / (step * step));
      }
    }

    // console.log(res);

    return res;
  }

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

  function preparePredictionFromDistances(
    distances: number[],
    lenght: number = 5
  ): PredictionDataType {
    try {
      let distancesWithLabels = distances.map((distance, i) => {
        const elem = { score: distance, label: `${i}` };
        return elem;
      });
      // console.log("Distances With Labels:");
      // console.table(distancesWithLabels);
      distancesWithLabels = distancesWithLabels.sort((a, b) => a.score - b.score);
      // console.log("Distances With Labels Sorted:");
      // console.table(distancesWithLabels);
      distancesWithLabels = distancesWithLabels.slice(0, lenght);
      // console.log("Distances With Labels Sorted Top 5:");
      // console.table(distancesWithLabels);

      let sum = 0;
      distancesWithLabels.forEach(({ score }) => {
        sum += 1 / score;
      });

      distancesWithLabels = distancesWithLabels.map(({ score, label }) => {
        return { score: (1 / score) / sum, label: label };
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

  const handleExport = async () => {
    if (stageRef.current) {
      // console.log(stageRef.current.toDataURL());
      const blob = await stageRef.current.toBlob();
      const ctx = stageRef.current?.toCanvas().getContext("2d");
      if (ctx) {
        const data = ctx.getImageData(0, 0, size, size).data;
        const sqData = squeeze(data, size, sqSize);
        const fastPrediction = compareWithCashed(sqData);
        if (fastPrediction.ok) {
          setPrediction(() => fastPrediction);
          localStorage.setItem(
            "pending",
            JSON.stringify({
              squeezed: sqData,
              prediction: fastPrediction,
            })
          );
          // addItemToLocalStorage(sqData, fastPrediction);
        } else {
          getPrediction(blob, sqData);
        }
      }
    }
  };

  function handleResolvedPrediction(
    prediction: { score: number; label: string }[],
    sqData: number[]
  ) {
    const newPrediction = {
      ok: true,
      label: prediction[0].label,
      data: prediction,
    };
    setPrediction(() => newPrediction);
    localStorage.setItem(
      "pending",
      JSON.stringify({
        squeezed: sqData,
        prediction: newPrediction,
      })
    );
  }

  const handleMouseDownEvent = (e: any) => {
    if (isTouchScreenDevice()) return;
    handleMouseDown(e);
  };

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMoveEvent = (e: any) => {
    if (isTouchScreenDevice()) return;
    handleMouseMove(e);
  };

  const handleMouseMove = (e: any) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUpEvent = () => {
    if (isTouchScreenDevice()) return;
    handleMouseUp();
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    handleExport();
  };

  const { active, setActive } = useContext(PopupContext);

  return (
    <>
      <Stage
        width={size}
        height={size}
        onMouseDown={handleMouseDownEvent}
        onMouseMove={handleMouseMoveEvent}
        onMouseUp={handleMouseUpEvent}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
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

export default Drawing;
