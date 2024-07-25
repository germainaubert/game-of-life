export function getCSSConstants() {
  const computedStyle = getComputedStyle(document.body);
  console.log(computedStyle.getPropertyValue('--grid-background-color'));
  const gridBackgroundColor = computedStyle.getPropertyValue('--grid-background-color');
  const gridLineColor = computedStyle.getPropertyValue('--grid-line-color');
  const gridLineShadowColor = computedStyle.getPropertyValue('--grid-line-shadow-color');
  const cellAliveColor = computedStyle.getPropertyValue('--cell-alive-color');

  return { 
    gridBackgroundColor,
    gridLineColor,
    gridLineShadowColor,
    cellAliveColor
   };
}
