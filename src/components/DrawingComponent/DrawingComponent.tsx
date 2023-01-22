import React, { useState, useRef, useContext } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
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

  async function query(url: any) {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/farleyknight/mnist-digit-classification-2022-09-04",
      {
        headers: { Authorization: "Bearer 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" },
        method: "POST",
        body: url,
      }
    );
    const result = await response.json();
    return result;
  }


  const handleExport = () => {
    if (stageRef.current) {
      stageRef.current.toBlob().then((res => {
        setTimeout(() => {
          query(res).then((response) => {
            const pred = response[0].label;
            console.log(pred);
            setNum((prev) => pred);
          });
        }, 1)
      }))
    }
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
