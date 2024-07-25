import type { CanvasToolInterface } from "../interfaces/GolInterface";

export default class CanvasTool implements CanvasToolInterface {
  // Game of life CanvasTool
  private cellPositionOffset: number;
  private cellRadius: number;
  private diameter: number;
  private padding: number;
  private gridColumns: number;
  private gridRows: number;

  constructor(pagePercentage: number, gridColumns: number, gridRows: number) {
    this.cellRadius = Math.ceil(((pagePercentage / 100) * window.innerWidth) / gridColumns / 2);
    this.diameter = this.cellRadius * 2;
    this.cellPositionOffset = this.cellRadius + this.cellRadius / 4; // offset 
    this.padding = Math.ceil(0.5 * this.cellRadius);
    this.gridColumns = gridColumns;
    this.gridRows = gridRows;
  }

  public getCellCircleCenter(position: number): number {
    return this.getAbsolutePosition(position) + this.cellPositionOffset;
  }
  
  public getCellRadius(): number {
    return this.cellRadius;
  }

  public getCellDiameter(): number {
    return this.diameter;
  }

  public getClearRectAxisValue(value: number): number {
    return Math.ceil(this.getAbsolutePosition(value) + this.padding / 2);
  }

  public getAbsolutePosition(position: number): number {
    return (this.padding + this.diameter) * position;
  }

  // takes the position on the axis as an argument and return the constant axis to draw a line
  public getConstantLineAxis(position: number): number {
    return this.getCellCircleCenter(position) + this.cellRadius + this.padding / 2;
  }

  public setCanvasSize(canvas: HTMLCanvasElement): void {
    canvas.width = this.getAbsolutePosition(this.gridColumns);
    canvas.height = this.getAbsolutePosition(this.gridRows);
  }
}