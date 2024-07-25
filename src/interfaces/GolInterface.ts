export interface CanvasToolInterface {
  getCellRadius(): number;
  getCellCircleCenter(position: number): number;
  getConstantLineAxis(position: number): number;
  getAbsolutePosition(position: number): number;
}

export interface Coordinate {
  x: number;
  y: number;
}