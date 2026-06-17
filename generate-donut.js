// Generate animated SVG donut - natural char sizing, no textLength stretch
const fs = require('fs');

function generateFrame(A, B) {
  const b = new Array(1760).fill(' ');
  const z = new Array(1760).fill(0);
  for (let j = 0; j < 6.28; j += 0.07) {
    for (let i = 0; i < 6.28; i += 0.02) {
      const sinI = Math.sin(i), cosI = Math.cos(i);
      const sinJ = Math.sin(j), cosJ = Math.cos(j);
      const sinA = Math.sin(A), cosA = Math.cos(A);
      const sinB = Math.sin(B), cosB = Math.cos(B);
      const h = cosJ + 2;
      const D = 1 / (sinI * h * sinA + sinJ * cosA + 5);
      const t = sinI * h * cosA - sinJ * sinA;
      const x = Math.floor(40 + 30 * D * (cosI * h * cosB - t * sinB));
      const y = Math.floor(12 + 15 * D * (cosI * h * sinB + t * cosB));
      const o = x + 80 * y;
      const N = Math.floor(8 * ((sinJ * sinA - sinI * cosJ * cosA) * cosB - sinI * cosJ * sinA - sinJ * cosA - cosI * cosJ * sinB));
      if (y > 0 && y < 22 && x > 0 && x < 80 && D > z[o]) {
        z[o] = D;
        b[o] = '.,-~:;=!*#$@'[N > 0 ? N : 0];
      }
    }
  }
  const lines = [];
  for (let k = 0; k < 22; k++) {
    lines.push(b.slice(k * 80, (k + 1) * 80).join(''));
  }
  return lines;
}

// Rainbow colors per row - full spectrum
const ROW_COLORS = [
  '#ff3366','#ff5500','#ff8800','#ffcc00',
  '#ccff00','#44ff44','#00ffcc','#00ccff',
  '#0088ff','#8844ff','#ff44ff','#ff3366',
  '#ff5500','#ff8800','#ffcc00','#ccff00',
  '#44ff44','#00ffcc','#00ccff','#0088ff',
  '#8844ff','#ff44ff',
];

const FRAMES = 24;
const DUR   = 2.4;

// Courier New at 10px: width ≈ 6px, lineHeight ≈ 12px
// So 80 cols × 6 = 480px wide, 22 rows × 12 = 264px tall
const FONT   = 10;
const CHAR_W = 6;
const LINE_H = 12;
const COLS   = 80;
const ROWS   = 22;
const PAD_X  = 12;
const PAD_Y  = 10;
const SVG_W  = COLS * CHAR_W + PAD_X * 2;   // 504
const SVG_H  = ROWS * LINE_H + PAD_Y * 2;   // 284

const frames = [];
for (let f = 0; f < FRAMES; f++) {
  frames.push(generateFrame(f * 0.25, f * 0.10));
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function smilParams(fi) {
  const s = +(fi / FRAMES).toFixed(4);
  const e = +((fi + 1) / FRAMES).toFixed(4);
  if (fi === 0)           return { kt: `0;${e};1`,     vals: `visible;hidden;hidden` };
  if (fi === FRAMES - 1) return { kt: `0;${s};1`,     vals: `hidden;visible;hidden` };
  return                         { kt: `0;${s};${e};1`, vals: `hidden;visible;hidden;hidden` };
}

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}">
<rect width="100%" height="100%" fill="#0d1117" rx="10"/>
<style>text{font-family:'Courier New',Courier,monospace;font-size:${FONT}px}</style>
`;

frames.forEach((lines, fi) => {
  const { kt, vals } = smilParams(fi);
  const initVis = fi === 0 ? 'visible' : 'hidden';
  svg += `<g visibility="${initVis}">
<animate attributeName="visibility" values="${vals}" keyTimes="${kt}" calcMode="discrete" dur="${DUR}s" repeatCount="indefinite"/>
`;
  lines.forEach((line, row) => {
    if (line.trim() === '') return;
    const x = PAD_X;
    const y = PAD_Y + (row + 1) * LINE_H;
    const color = ROW_COLORS[row % ROW_COLORS.length];
    svg += `<text x="${x}" y="${y}" fill="${color}">${esc(line)}</text>\n`;
  });
  svg += `</g>\n`;
});

svg += `</svg>`;

fs.writeFileSync('donut2.svg', svg);
const kb = (Buffer.byteLength(svg) / 1024).toFixed(1);
console.log(`donut2.svg: ${SVG_W}x${SVG_H}px, ${FRAMES} frames, ${DUR}s, ${kb} KB`);
