export declare class Matrix {
    private data;
    readonly rows: number;
    readonly columns: number;
    constructor(data: number[][] | number, columns?: number);
    static zeros(rows: number, columns: number): Matrix;
    static from2DArray(data: number[][]): Matrix;
    get(row: number, column: number): number;
    set(row: number, column: number, value: number): void;
    getRow(row: number): number[];
    getColumn(column: number): number[];
    transpose(): Matrix;
    clone(): Matrix;
    toArray(): number[][];
}
export declare function ensure2D(X: number[] | number[][]): Matrix;
export declare function choleskyDecomposition(matrix: Matrix): Matrix;
