import React, { useState, useRef, useContext, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import PredictionContext from "../Context/PredictionContext";
import PopupContext from "../Context/PopupContext";
import userEvent from "@testing-library/user-event";

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

  const size = 240;
  const sqSize = 24; // Squeezed Size
  const labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const [lines, setLines] = useState<Point[]>([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const { num, setNum } = useContext(PredictionContext);

  useEffect(() => {
    // console.log('Num changed to:', num);
    if (stageRef.current && num === "") {
      const layers = stageRef.current.getChildren();
      layers.forEach((layer) => layer.destroyChildren());
    }
  }, [num]);

  async function getPrediction(data: any, sqData: number[]) {
    fetch(
      "https://api-inference.huggingface.co/models/farleyknight/mnist-digit-classification-2022-09-04",
      {
        headers: {
          Authorization: "Bearer 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",
        },
        method: "POST",
        body: data,
      }
    ).then((res) => {
      if (!res.ok) {
        setTimeout(() => {
          setActive((prev) => true);
          getPrediction(data, sqData);
        }, 1000);
      } else {
        const _ = res.json().then((body) => {
          console.table(body);
          const prediction = body[0].label;
          setActive((prev) => false);
          handleResolvedPrediction(prediction, sqData);
        });
      }
    });
  }

  function squeeze(data: Uint8ClampedArray): number[] {
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
    console.log("Step:", step);

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
    return Math.sqrt(sum);
  }

  function compareWithCashed(input: number[]): string {
    let threshold = 1e-2;
    if (localStorage.length < 10) {
      threshold = 7.1e-9;
    }
    let distances: number[] = [];
    labels.forEach((label) => {
      const rawItem = localStorage.getItem(label);
      if (rawItem) {
        const item: LocalStorageItem = JSON.parse(rawItem);
        distances.push(getDistance(input, item.average));
      } else {
        distances.push(sqSize);
      }
    });

    let sum = 0;
    distances.forEach((elem) => {
      sum += Math.exp(elem);
    });

    distances = distances.map((elem) => Math.exp(elem) / sum);

    const fastPrediction = distances.indexOf(Math.min(...distances));

    console.log("Distances:", distances);
    console.log("LocalStorage:", localStorage);

    const storedAccuracy: AccuracyData = JSON.parse(
      localStorage.getItem("accuracy") || ""
    );
    const successCoefficient =
      storedAccuracy.success /
      (storedAccuracy.success + storedAccuracy.failure);

    console.table(storedAccuracy);

    if (localStorage.getItem(labels[fastPrediction])) {
      const item: LocalStorageItem = JSON.parse(
        localStorage.getItem(labels[fastPrediction]) || ""
      );
      if (item.mustMakeRequest) return "";
    }

    if (
      distances[fastPrediction] <= threshold &&
      successCoefficient > props.coefficient
    ) {
      console.log(distances[fastPrediction], "<=", threshold);
      return labels[fastPrediction];
    }

    return "";
  }

  const handleExport = () => {
    if (stageRef.current) {
      stageRef.current.toBlob().then((res) => {
        // getPrediction(res);
        const ctx = stageRef.current?.toCanvas().getContext("2d");
        if (ctx) {
          const data = ctx.getImageData(0, 0, size, size).data;
          const sqData = squeeze(data);
          const fastPrediction = compareWithCashed(sqData);
          if (fastPrediction) {
            setNum((prev) => fastPrediction);
            localStorage.setItem(
              "pending",
              JSON.stringify({
                squeezed: sqData,
                label: fastPrediction,
              })
            );
            // addItemToLocalStorage(sqData, fastPrediction);
          } else {
            getPrediction(res, sqData);
          }
        }
      });
    }
  };

  function handleResolvedPrediction(prediction: string, sqData: number[]) {
    setNum((prev) => prediction);
    localStorage.setItem(
      "pending",
      JSON.stringify({
        squeezed: sqData,
        label: prediction,
      })
    );
  }

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
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
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
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
