export class Matrix {
  private data: number[][];
  public readonly rows: number;
  public readonly columns: number;

  constructor(data: number[][] | number, columns?: number) {
    if (typeof data === 'number') {
      if (columns === undefined) {
        throw new Error('Columns parameter required when creating matrix from dimensions');
      }
      this.rows = data;
      this.columns = columns;
      this.data = Array(this.rows).fill(0).map(() => Array(this.columns).fill(0));
    } else {
      this.data = data.map(row => [...row]);
      this.rows = this.data.length;
      this.columns = this.data[0]?.length || 0;
    }
  }

  static zeros(rows: number, columns: number): Matrix {
    return new Matrix(rows, columns);
  }

  static from2DArray(data: number[][]): Matrix {
    return new Matrix(data);
  }

  get(row: number, column: number): number {
    if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
      throw new Error(`Index out of bounds: (${row}, ${column})`);
    }
    return this.data[row][column];
  }

  set(row: number, column: number, value: number): void {
    if (row < 0 || row >= this.rows || column < 0 || column >= this.columns) {
      throw new Error(`Index out of bounds: (${row}, ${column})`);
    }
    this.data[row][column] = value;
  }

  getRow(row: number): number[] {
    if (row < 0 || row >= this.rows) {
      throw new Error(`Row index out of bounds: ${row}`);
    }
    return [...this.data[row]];
  }

  getColumn(column: number): number[] {
    if (column < 0 || column >= this.columns) {
      throw new Error(`Column index out of bounds: ${column}`);
    }
    return this.data.map(row => row[column]);
  }

  transpose(): Matrix {
    const transposed = Array(this.columns).fill(0).map(() => Array(this.rows).fill(0));
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        transposed[j][i] = this.data[i][j];
      }
    }
    return new Matrix(transposed);
  }

  clone(): Matrix {
    return new Matrix(this.data);
  }

  toArray(): number[][] {
    return this.data.map(row => [...row]);
  }
}

export function ensure2D(X: number[] | number[][]): Matrix {
  if (Array.isArray(X[0])) {
    return Matrix.from2DArray(X as number[][]);
  } else {
    return Matrix.from2DArray([(X as number[])]);
  }
}

export function choleskyDecomposition(matrix: Matrix): Matrix {
  if (matrix.rows !== matrix.columns) {
    throw new Error('Matrix must be square for Cholesky decomposition');
  }

  const n = matrix.rows;
  const L = Matrix.zeros(n, n);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      if (i === j) {
        let sum = 0;
        for (let k = 0; k < j; k++) {
          sum += L.get(j, k) * L.get(j, k);
        }
        const diagonal = matrix.get(j, j) - sum;
        if (diagonal <= 0) {
          throw new Error(`Matrix is not positive definite at position (${j}, ${j})`);
        }
        L.set(j, j, Math.sqrt(diagonal));
      } else {
        let sum = 0;
        for (let k = 0; k < j; k++) {
          sum += L.get(i, k) * L.get(j, k);
        }
        L.set(i, j, (matrix.get(i, j) - sum) / L.get(j, j));
      }
    }
  }

  return L;
}