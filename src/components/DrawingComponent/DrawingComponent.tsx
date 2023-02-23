import React, { useState, useRef, useContext, useEffect } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import PredictionContext from "../Context/PredictionContext";
import PopupContext from "../Context/PopupContext";
import { isTouchScreenDevice, squeeze, getDistance } from "./Functions";

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
  const { num, setNum } = useContext(PredictionContext);

  const remSize = 60;
  const size = Math.floor(
    (parseInt(getComputedStyle(document.documentElement).fontSize) * remSize) /
      4
  );

  useEffect(() => {
    // console.log('Num changed to:', num);
    if (stageRef.current && num === "") {
      const layers = stageRef.current.getChildren();
      layers.forEach((layer) => layer.destroyChildren());
    }
  }, [num]);

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
        setActive((prev) => true);
        getPrediction(data, sqData);
      }, 1000);
    } else {
      const body = await res.json();
      console.table(body);
      const prediction = body[0].label;
      setActive((prev) => false);
      handleResolvedPrediction(prediction, sqData);
    }
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

  const handleExport = async () => {
    if (stageRef.current) {
      console.log(stageRef.current.toDataURL());
      const blob = await stageRef.current.toBlob();
      const ctx = stageRef.current?.toCanvas().getContext("2d");
      if (ctx) {
        const data = ctx.getImageData(0, 0, size, size).data;
        const sqData = squeeze(data, size, sqSize);
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
          await getPrediction(blob, sqData);
        }
      }
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

  const handleMouseDownEvent = (e: any) => {
    if (isTouchScreenDevice()) return;
    handleMouseDown(e);
  }

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  const handleMouseMoveEvent = (e: any) => {
    if (isTouchScreenDevice()) return;
    handleMouseMove(e);
  }

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
  }

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
