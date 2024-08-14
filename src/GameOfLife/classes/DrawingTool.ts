import type GridCell from "@/GameOfLife/classes/GridCell";
import { cellAliveColor, gridBackgroundColor } from "@/styles/_constants";


export class DrawingTool {
  private animationDuration: number;
  private ctx: CanvasRenderingContext2D;
  private maxRadius: number;
  private diameter: number;
  private padding: number; 
  private aliveCellAnimationRadius: number;
  private animations: Animation[];
  constructor(intervalDuration: number, ctx: CanvasRenderingContext2D, radius: number) {
    this.animationDuration = this.getAnimationDuration(intervalDuration);
    this.ctx = ctx;
    this.maxRadius = radius;
    this.diameter = radius * 2;
    this.padding = Math.ceil(0.5 * radius);
    this.aliveCellAnimationRadius = radius;
    this.animations = [];
  }

  public requestDraw(cells: GridCell[]) {
    console.log('draw');
    const animation = new Animation(cells, this.animationDuration);
    this.animations.push(animation);
    this.requestAnimation(animation);
  }

  public cancelAnimations() {
    this.animations.forEach(animation => {
      if (animation.id) cancelAnimationFrame(animation.id);
    });
    this.animations = [];
  }

  private drawCell(x: number, y: number, alive: boolean) {
    // if cell is dying clear the zone, also prevents antialiazing exceeding
    if(!alive) {
      this.ctx.fillStyle = gridBackgroundColor;
      this.ctx.fillRect(
      this.getAbsolutePosition(x),
      this.getAbsolutePosition(y),
      this.diameter + this.padding,
      this.diameter + this.padding
    );
    }
    this.ctx.beginPath();
    this.ctx.shadowColor = 'transparent';
    this.ctx.arc(
      this.getCellCircleCenter(x),
      this.getCellCircleCenter(y),
      this.getCurrentCellRadius(alive),
      0,
      2 * Math.PI
    );
    this.ctx.lineWidth = 0;
    this.ctx.fillStyle = cellAliveColor;
    this.ctx.fill();
  }
  
  private animate(timeStamp: number, animation: Animation): void {
    if(animation.animationDuration > 0) {
      if(!animation.animationStartTime) {
        animation.animationStartTime = timeStamp;
      }
      const elapsed = timeStamp - animation.animationStartTime;
      const progress = Math.min(elapsed / animation.animationDuration, 1);
      this.aliveCellAnimationRadius = this.maxRadius * progress;
      if(progress < 1) {
        this.requestAnimation(animation);
      } else {
        this.animations = this.animations.filter(arrayAnim => arrayAnim.id !== animation.id);
      }
    }
    animation.cells.forEach(cell => this.drawCell(cell.x, cell.y, cell.alive));
  }

  private requestAnimation(animation: Animation) {
    animation.id = requestAnimationFrame((timeStamp) => this.animate(timeStamp, animation));
  }

  private getCurrentCellRadius(cellAlive: boolean): number {
    if(cellAlive) return this.aliveCellAnimationRadius;
    else return this.maxRadius - this.aliveCellAnimationRadius;
  }

  public getAbsolutePosition(position: number) {
    return (this.padding + this.diameter) * position;
  }

  private getCellCircleCenter(position: number): number {
    return this.getAbsolutePosition(position) + this.getCellPositionOffset();
  }

  private getCellPositionOffset(): number {
    return this.maxRadius + this.maxRadius / 4;
  }

  public updateAnimationDuration(intervalDuration: number) {
    this.animationDuration = this.getAnimationDuration(intervalDuration);
  }

  private getAnimationDuration(intervalDuration: number) {
    return Math.round(intervalDuration * 0.9);
  }
}

class Animation {
  cells: GridCell[];
  animationStartTime: number | null;
  id: number | null;
  animationDuration: number;
  constructor(cells: GridCell[], animationDuration: number) {
    this.cells = cells;
    this.animationStartTime = null;
    this.id = null;
    this.animationDuration = animationDuration;
  }
}