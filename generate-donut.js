// Generate animated SVG donut - SMIL animation, rainbow rows
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

// Rainbow colors per row
const ROW_COLORS = [
  '#ff3366','#ff6600','#ffaa00','#ffee00',
  '#aaff00','#00ffaa','#00eeff','#aa55ff',
  '#ff33cc','#ff3366','#ff6600','#ffaa00',
  '#ffee00','#aaff00','#00ffaa','#00eeff',
  '#aa55ff','#ff33cc','#ff3366','#ff6600',
  '#ffaa00','#ffee00',
];

const FRAMES = 24;
const DUR = 2.4; // total seconds
const frames = [];
for (let f = 0; f < FRAMES; f++) {
  frames.push(generateFrame(f * 0.25, f * 0.10));
}

const SVG_W = 560, SVG_H = 176;
const mX = 8, mY = 6;
const cellH = (SVG_H - mY * 2) / 22;

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Build SMIL keyTimes and values for each frame
function smilParams(fi) {
  // visible only during frame fi's time window
  const kts = [], vals = [];
  for (let i = 0; i <= FRAMES; i++) {
    const pct = +(i / FRAMES).toFixed(4);
    kts.push(pct);
    if (i === fi) {
      vals.push('visible');
    } else if (i === fi + 1) {
      vals.push('hidden');
    } else {
      vals.push(i < fi || i > fi + 1 ? 'hidden' : 'hidden');
    }
  }
  // simplify: only need 4 keyTimes: 0, fi/N, (fi+1)/N, 1
  const s = +(fi / FRAMES).toFixed(4);
  const e = +((fi + 1) / FRAMES).toFixed(4);
  if (fi === 0) {
    return { keyTimes: `0;${e};1`, values: `visible;hidden;hidden` };
  } else if (fi === FRAMES - 1) {
    return { keyTimes: `0;${s};1`, values: `hidden;visible;hidden` };
  } else {
    return { keyTimes: `0;${s};${e};1`, values: `hidden;visible;hidden;hidden` };
  }
}

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}">
<rect width="100%" height="100%" fill="#0d1117" rx="12"/>
<style>text{font-family:'Courier New',Courier,monospace;font-size:7px}</style>
`;

frames.forEach((lines, fi) => {
  const { keyTimes, values } = smilParams(fi);
  const initVis = fi === 0 ? 'visible' : 'hidden';
  svg += `<g visibility="${initVis}">
<animate attributeName="visibility" values="${values}" keyTimes="${keyTimes}" calcMode="discrete" dur="${DUR}s" repeatCount="indefinite"/>
`;
  lines.forEach((line, row) => {
    if (line.trim() === '') return;
    const y = (mY + (row + 0.85) * cellH).toFixed(1);
    const color = ROW_COLORS[row % ROW_COLORS.length];
    svg += `<text x="${mX}" y="${y}" fill="${color}" textLength="${SVG_W - mX * 2}" lengthAdjust="spacingAndGlyphs">${esc(line)}</text>\n`;
  });
  svg += `</g>\n`;
});

svg += `</svg>`;

fs.writeFileSync('donut2.svg', svg);
const kb = (Buffer.byteLength(svg) / 1024).toFixed(1);
console.log(`donut2.svg: ${FRAMES} frames, ${DUR}s, ${kb} KB`);
