export interface CanvasToolInterface {
  getCellRadius(): number;
  getCellCircleCenter(position: number): number;
  getConstantLineAxis(position: number): number;
  getAbsolutePosition(position: number): number;
}

export interface DrawingCellInfo {
  coords: Coordinate;
  status: boolean;
}

export interface Coordinate {
  x: number,
  y: number
}