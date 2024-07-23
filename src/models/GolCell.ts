export default class GolCell {
  // Game of life Cell class
  public positionOffset: number;
  public radius: number;
  public diameter: number;
  public padding: number;

  constructor(positionOffset: number = 40, radius: number = 20, diameter: number = 40, padding: number = 5) {
    this.positionOffset = positionOffset;
    this.radius = radius;
    this.diameter = diameter;
    this.padding = padding;
  }
  
  public getCellCenterPosition(position: number) {
    return this.padding * position + this.diameter * position + this.positionOffset;
  }
}