import React, { useState, useRef, useContext } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import * as tf from "@tensorflow/tfjs";
import PredictionContext from "../Context/PredictionContext";

const Drawing = () => {
  class Point {
    points: number[] = [];
  }

  const size = 200;

  const [lines, setLines] = useState<Point[]>([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const { num, setNum } = useContext(PredictionContext);

  const makePrediction = (data: number[][][]) => {
    tf.loadLayersModel(
      tf.io.fromMemory(require("../../model/model.json"))
    ).then((model) => {
      let pred = model.apply(tf.tensor([data])).toString()
      pred = pred.slice(14).slice(0, pred.length - 17);
      console.log(pred);
      const arr = JSON.parse(`[${pred}]`);
      const ans = arr.indexOf(Math.max.apply(Math, arr))
      setNum(prev => ans);
      console.log("Prediction:", ans);
    });
  };

  const handleData = (data: Uint8ClampedArray) => {
    let matrix: number[][] = [];
    for (let i = 0; i < size; i++) {
      let line: number[] = [];
      for (let j = 0; j < size; j++) {
        line.push(data[i * size + j]);
      }
      matrix.push([...line]);
    }
    let compressedMatrix: number[][] = [];
    const k = Math.floor(size / 28);
    for (let i = 0; i < 28; i++) {
      let line: number[] = [];
      for (let j = 0; j < 28; j++) {
        let average = 0;
        for (let m = k * i; m < k * (i + 1); m++) {
          for (let n = k * j; n < k * (j + 1); n++) {
            average += matrix[m][n];
          }
        }
        average = Math.floor(average / Math.pow(k, 2)) / 255;
        line.push(average);
      }
      compressedMatrix.push([...line]);
    }
    let modelDataInput: number[][][] = [];
    compressedMatrix.forEach((line) => {
      let newLine: number[][] = [];
      line.forEach(num => {
        newLine.push([num]);
      });
      modelDataInput.push(newLine);
    });
    console.log(modelDataInput);
    makePrediction(modelDataInput);
  };

  const handleExport = () => {
    if (stageRef.current) {
      const ctx = stageRef.current.toCanvas().getContext("2d");
      const data = ctx?.getImageData(0, 0, 200, 200).data;
      setNum(prev => "...")
      if (data) handleData(data.slice(0, data.length / 4));
      // return stageRef.current.toDataURL();
    }

    // setUrl((prev) => {
      
    //   return prev;
    // });
  };

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

  return (
    <div style={{ width: size, height: size }}>
      <Stage
        width={size}
        height={size}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        style={{ background: "black" }}
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
    </div>
  );
};

export default Drawing;
