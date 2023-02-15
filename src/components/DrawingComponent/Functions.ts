export const isTouchScreenDevice = () => {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }
};


export function squeeze(
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

export function getDistance(a: number[], b: number[]) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}
