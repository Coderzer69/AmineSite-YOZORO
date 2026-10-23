/** Original generated artwork: a moon over hills, tinted by hue. No external assets. */
export function art(hue: number, w: number, h: number): string {
  const h2 = (hue + 40) % 360;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='hsl(${hue} 70% 38%)'/>` +
    `<stop offset='1' stop-color='hsl(${h2} 60% 12%)'/></linearGradient></defs>` +
    `<rect width='100%' height='100%' fill='url(#g)'/>` +
    `<circle cx='${w * 0.72}' cy='${h * 0.28}' r='${Math.min(w, h) * 0.2}' fill='hsl(${hue} 90% 82%)' opacity='.85'/>` +
    `<path d='M0 ${h * 0.78} Q ${w * 0.3} ${h * 0.6} ${w * 0.55} ${h * 0.76} T ${w} ${h * 0.7} V ${h} H 0 Z' fill='hsl(${h2} 50% 8%)' opacity='.8'/>` +
    `<path d='M0 ${h * 0.9} Q ${w * 0.4} ${h * 0.78} ${w * 0.7} ${h * 0.9} T ${w} ${h * 0.86} V ${h} H 0 Z' fill='hsl(${h2} 45% 5%)'/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}