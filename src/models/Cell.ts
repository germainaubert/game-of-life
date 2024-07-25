import { cellAliveColor, gridBackgroundColor } from '@/utils/cssConstants';
import type CanvasTool from './CanvasTool';

export default class Cells {
  private x: number;
  private y: number;
  private alive: boolean;
  private ctx?: CanvasRenderingContext2D;
  private canvasTool?: CanvasTool;
  private static initialLifeProbability: number = 0.3; // chance of getting alive on randomize

  constructor(
    x: number,
    y: number,
    alive?: boolean
  ) {
    this.x = x;
    this.y = y;
    if (alive === undefined) {
      alive = this.getRandomizedStatus();
    }
    this.alive = alive;
  }

  // draw cell is called on cell initialization
  public drawCell() {
    if(!this.ctx || !this.canvasTool) throw new ReferenceError("Unable to draw cell, drawing tools undefined");
    if (this.alive) {
      this.ctx.beginPath();
      this.ctx.shadowColor = 'transparent';
      this.ctx.arc(
        this.canvasTool.getCellCircleCenter(this.x),
        this.canvasTool.getCellCircleCenter(this.y),
        this.canvasTool.getCellRadius(),
        0,
        2 * Math.PI
      );
      this.ctx.lineWidth = 0;
      this.ctx.fillStyle = cellAliveColor;
      this.ctx.fill();
    }
    else {
      // clear the zone of the cell to prevent antialiazing overtaking
      this.ctx.fillStyle = gridBackgroundColor;
      this.ctx.fillRect(
        this.canvasTool.getClearRectAxisValue(this.x) - 1,
        this.canvasTool.getClearRectAxisValue(this.y) - 1,
        this.canvasTool.getCellDiameter() + 2,
        this.canvasTool.getCellDiameter() + 2
      );
    }
  }

  public randomizeStatus() {
    const newStatus = this.getRandomizedStatus();
    this.updateStatus(this.alive, newStatus);
  }

  private getRandomizedStatus(): boolean {
    if (Math.random() > Cells.initialLifeProbability) return false;
    else return true;
  }

  public updateStatus(oldStatus: boolean, newStatus: boolean) {
    if(oldStatus != newStatus) {

      this.alive = newStatus;
      this.drawCell();
    }
  }

  public inverseStatus() {
    this.alive = !this.alive;
    this.drawCell();
  }

  public getStatus() {
    return this.alive;
  }

  public setDrawingTools(ctx: CanvasRenderingContext2D, canvasTool: CanvasTool): void {
    this.ctx = ctx;
    this.canvasTool = canvasTool;
  }
}
