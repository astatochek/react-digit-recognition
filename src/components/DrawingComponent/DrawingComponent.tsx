import React, { useState, useRef, useContext } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import PredictionContext from "../Context/PredictionContext";

const Drawing = () => {
  class Point {
    points: number[] = [];
  }

  interface LocalStorageItem {
    average: number[];
    num: number;
  }

  const size = 240;
  const sqSize = 8; // Squeezed Size
  const labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const [lines, setLines] = useState<Point[]>([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const { num, setNum } = useContext(PredictionContext);

  async function getPrediction(data: any) {

    const res = new Promise<string>(resolve => {
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
        if (res.status !== 200) {
          setTimeout(() => {
            getPrediction(data);
          }, 1000);
        } else {
          const prediction = res.json().then((body) => {
            console.log(body);
            const prediction = body[0].label;
            // setNum((prev) => prediction);
            resolve(prediction);
          });
        }
      });
    })

    return await res;
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

  function getAverage(input: number[], base: number[], num: number): number[] {
    const nextAverage: number[] = [];
    base.forEach((elem, i) => {
      nextAverage.push((elem + input[i]) / (num + 1))
    })
    return nextAverage;
  }

  function addItemToLocalStorage(input: number[], label: string) {
    const rawItem = localStorage.getItem(label);
    if (rawItem) {
      const item: LocalStorageItem = JSON.parse(rawItem);
      localStorage.setItem(
        label,
        JSON.stringify({
          average: getAverage(input, item.average, item.num),
          num: item.num + 1
        })
      );
    } else {
      localStorage.setItem(
        label,
        JSON.stringify({
          average: input,
          num: 1,
        })
      );
    }
  }

  function compareWithCashed(input: number[]): string {
    const threshold = 0.025;
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
    distances.forEach(elem => {
      sum += elem;
    })

    distances = distances.map(elem => elem / sum);

    const fastPrediction = distances.indexOf(Math.min(...distances));

    console.log('Distances:', distances);
    console.log('LocalStorage:', localStorage)

    if (distances[fastPrediction] <= threshold) {
      console.log(distances[fastPrediction], '<=', threshold);
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
            setNum(prev => fastPrediction);
            addItemToLocalStorage(sqData, fastPrediction);
          } else {
            getPrediction(res).then(prediction => {
              setNum(prev => prediction);
              addItemToLocalStorage(sqData, prediction);
            })
          }
        }
      });
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
    <div className="w-60 h-60">
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
