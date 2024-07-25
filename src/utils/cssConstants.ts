const computedStyle = getComputedStyle(document.body);
const gridBackgroundColor = computedStyle.getPropertyValue('--grid-background-color');
const gridLineColor = computedStyle.getPropertyValue('--grid-line-color');
const gridLineShadowColor = computedStyle.getPropertyValue('--grid-line-shadow-color');
const cellAliveColor = computedStyle.getPropertyValue('--cell-alive-color');

export { gridBackgroundColor, gridLineColor, gridLineShadowColor, cellAliveColor }
