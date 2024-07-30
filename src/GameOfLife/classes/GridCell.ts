export default class GridCell {
  readonly x: number;
  readonly y: number;
  public alive: boolean;

  private static initialLifeProbability: number = 0.3; // chance of getting alive on randomize

  constructor(x: number, y: number, alive?: boolean) {
    this.x = x;
    this.y = y;
    if (alive === undefined) alive = this.getRandomizedStatus();
    this.alive = alive;
  }

  public getRandomizedStatus(): boolean {
    if (Math.random() > GridCell.initialLifeProbability) return false;
    else return true;
  }

  public setRandomizedStatus(): void {
    this.alive = this.getRandomizedStatus();
  }
}