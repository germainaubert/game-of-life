export interface CellDisplayInfo {
  positionOffset: number;
  radius: number;
  diameter: number;
  padding: number;
  getCellCenterPosition(position: number): number;
}

export interface Coordinate {
  x: number,
  y: number
}