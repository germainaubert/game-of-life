// import { cellAliveColor, gridBackgroundColor } from '@/utils/cssConstants';
// import GridCell from './GridCell';

// export default class CanvasCell extends GridCell {
//   private radius: number; // keep track of radius during animation, reminder that canvasTool is responsible of calculating the final cell radius 
//   private animationStartTime?: number;
//   private canvasTool: CanvasTool;
//   private ctx: CanvasRenderingContext2D;
//   private animationDuration: number;

//   constructor(
//     x: number,
//     y: number,
//     canvasTool: CanvasTool,
//     ctx: CanvasRenderingContext2D,
//     intervalDuration: number,
//     alive?: boolean
//   ) {
//     super(x, y, alive);
//     this.canvasTool = canvasTool;
//     this.ctx = ctx;
//     this.animationDuration = this.calculateAnimationDuration(intervalDuration);
//     this.radius = this.getRadius();
//   }

//   public updateStatus() {
//     this.alive = !this.alive;
//     this.triggerAnimation(); 
//   }

//   private drawCell() {
//     // if cell is dying clear the zone, also prevents antialiazing exceeding
//     if(!this.alive) {
//       this.ctx.fillStyle = gridBackgroundColor;
//       this.ctx.fillRect(
//         this.canvasTool.getClearRectAxisValue(this.x) - 1,
//         this.canvasTool.getClearRectAxisValue(this.y) - 1,
//         this.canvasTool.getCellDiameter() + 2,
//         this.canvasTool.getCellDiameter() + 2
//       );
//     }

//     this.ctx.beginPath();
//     this.ctx.shadowColor = 'transparent';
//     this.ctx.arc(
//       this.canvasTool.getCellCircleCenter(this.x),
//       this.canvasTool.getCellCircleCenter(this.y),
//       this.radius,
//       0,
//       2 * Math.PI
//     );
//     this.ctx.lineWidth = 0;
//     this.ctx.fillStyle = cellAliveColor;
//     this.ctx.fill();
//   }

//   private animateCell(timeStamp: number) {
//     if(this.animationDuration > 0) {
//       if(!this.animationStartTime) {
//         this.animationStartTime = timeStamp;
//       }
//       const elapsed = timeStamp - this.animationStartTime;
//       const progress = Math.min(elapsed / this.animationDuration, 1);
//       const targetRadius = this.canvasTool.getCellRadius();
//       if(this.alive) this.radius = targetRadius * progress;
//       else this.radius = targetRadius * (1 - progress);
  
//       if(progress < 1) {
//         requestAnimationFrame(this.animateCell.bind(this));
//       }
//     }
//     this.drawCell();
//   }

//   public triggerAnimation() {
//     if(this.alive) {
//       this.radius = 0;
//     } else {
//       this.radius = this.canvasTool.getCellDiameter();
//     }
//     this.animationStartTime = undefined;
//     requestAnimationFrame(this.animateCell.bind(this));
//   }

//   public getStatus() {
//     return this.alive;
//   }

//   private calculateAnimationDuration(intervalDuration: number): number {
//     return Math.round(intervalDuration * 0.6);
//   }

//   private getRadius(): number {
//     return this.alive ? 0 : this.canvasTool.getCellRadius();
//   }
// }
