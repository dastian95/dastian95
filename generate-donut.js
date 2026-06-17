// Generate animated SVG of spinning ASCII donut - rainbow rows, compact
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

// Rainbow colors per row (cycling)
const ROW_COLORS = [
  '#ff0055','#ff4400','#ff8800','#ffcc00',
  '#88ff00','#00ffaa','#00ccff','#aa00ff',
  '#ff00cc','#ff0055','#ff4400','#ff8800',
  '#ffcc00','#88ff00','#00ffaa','#00ccff',
  '#aa00ff','#ff00cc','#ff0055','#ff4400',
  '#ff8800','#ffcc00',
];

const FRAMES = 24;
const frames = [];
for (let f = 0; f < FRAMES; f++) {
  frames.push(generateFrame(f * 0.25, f * 0.10));
}

const SVG_W = 560, SVG_H = 180;
const mX = 8, mY = 6;
const cellH = (SVG_H - mY * 2) / 22;
const duration = FRAMES * 0.07; // ~1.7s

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}">
<rect width="100%" height="100%" fill="#0d1117" rx="12"/>
<style>.fr{visibility:hidden}
${frames.map((_, i) => {
  const s = (i/FRAMES*100).toFixed(1), e = ((i+1)/FRAMES*100).toFixed(1);
  return `@keyframes a${i}{0%,${s}%{visibility:hidden}${s}%{visibility:visible}${e}%,100%{visibility:hidden}}`;
}).join('')}
${frames.map((_, i) => `.f${i}{animation:a${i} ${duration}s steps(1,start) infinite}`).join('')}
</style>
`;

frames.forEach((lines, fi) => {
  svg += `<g class="fr f${fi}">`;
  lines.forEach((line, row) => {
    if (line.trim() === '') return;
    const y = (mY + (row + 0.85) * cellH).toFixed(1);
    const color = ROW_COLORS[row % ROW_COLORS.length];
    svg += `<text x="${mX}" y="${y}" fill="${color}" font-family="'Courier New',monospace" font-size="7" textLength="${SVG_W - mX*2}" lengthAdjust="spacingAndGlyphs">${esc(line)}</text>`;
  });
  svg += `</g>\n`;
});

svg += `</svg>`;

fs.writeFileSync('donut.svg', svg);
const kb = (Buffer.byteLength(svg) / 1024).toFixed(1);
console.log(`donut.svg: ${FRAMES} frames, ${duration.toFixed(2)}s loop, ${kb} KB`);
