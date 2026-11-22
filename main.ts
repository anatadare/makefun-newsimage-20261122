// THE WORLD TODAY - Sunday 22 November 2026
// A newspaper front page drawn in code, pixel by pixel.
// No network, no fonts, no dependencies: only Node's standard library.
// The program writes one 1024x1024 PNG to /output/entry.png.
// Every run produces the exact same bytes.

import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

// ---------------------------------------------------------------- canvas

const W = 1024;
const H = 1024;
const px = Buffer.alloc(W * H * 3);

type RGB = readonly [number, number, number];

const PAPER: RGB = [247, 242, 231];
const INK: RGB = [22, 22, 22];
const RED: RGB = [178, 34, 27];
const NAVY: RGB = [26, 48, 84];
const SEA: RGB = [46, 111, 158];
const LAND: RGB = [74, 140, 82];
const GREY: RGB = [96, 92, 84];
const WHITE: RGB = [255, 255, 255];
const SAND: RGB = [232, 222, 198];
const GOLD: RGB = [196, 148, 44];

// ---------------------------------------------------------------- font
// A 5x7 pixel font, drawn from scratch. Each glyph is 7 rows; each row is
// a 5-bit number, bit 4 is the leftmost pixel. Lowercase letters sit on the
// same 7-row grid with a 5-row x-height.

const FONT: Record<string, number[]> = {
  A: [14, 17, 17, 31, 17, 17, 17],
  B: [30, 17, 17, 30, 17, 17, 30],
  C: [14, 17, 16, 16, 16, 17, 14],
  D: [30, 17, 17, 17, 17, 17, 30],
  E: [31, 16, 16, 30, 16, 16, 31],
  F: [31, 16, 16, 30, 16, 16, 16],
  G: [14, 17, 16, 23, 17, 17, 15],
  H: [17, 17, 17, 31, 17, 17, 17],
  I: [14, 4, 4, 4, 4, 4, 14],
  J: [7, 2, 2, 2, 2, 18, 12],
  K: [17, 18, 20, 24, 20, 18, 17],
  L: [16, 16, 16, 16, 16, 16, 31],
  M: [17, 27, 21, 21, 17, 17, 17],
  N: [17, 25, 21, 19, 17, 17, 17],
  O: [14, 17, 17, 17, 17, 17, 14],
  P: [30, 17, 17, 30, 16, 16, 16],
  Q: [14, 17, 17, 17, 21, 18, 13],
  R: [30, 17, 17, 30, 20, 18, 17],
  S: [15, 16, 16, 14, 1, 1, 30],
  T: [31, 4, 4, 4, 4, 4, 4],
  U: [17, 17, 17, 17, 17, 17, 14],
  V: [17, 17, 17, 17, 17, 10, 4],
  W: [17, 17, 17, 21, 21, 21, 10],
  X: [17, 17, 10, 4, 10, 17, 17],
  Y: [17, 17, 10, 4, 4, 4, 4],
  Z: [31, 1, 2, 4, 8, 16, 31],
  a: [0, 0, 14, 1, 15, 17, 15],
  b: [16, 16, 30, 17, 17, 17, 30],
  c: [0, 0, 14, 17, 16, 17, 14],
  d: [1, 1, 15, 17, 17, 17, 15],
  e: [0, 0, 14, 17, 31, 16, 14],
  f: [6, 9, 8, 30, 8, 8, 8],
  g: [0, 0, 14, 17, 17, 15, 1],
  h: [16, 16, 30, 17, 17, 17, 17],
  i: [4, 0, 12, 4, 4, 4, 14],
  j: [2, 0, 6, 2, 2, 2, 12],
  k: [16, 16, 18, 20, 24, 20, 18],
  l: [12, 4, 4, 4, 4, 4, 14],
  m: [0, 0, 26, 21, 21, 21, 21],
  n: [0, 0, 30, 17, 17, 17, 17],
  o: [0, 0, 14, 17, 17, 17, 14],
  p: [0, 0, 30, 17, 17, 30, 16],
  q: [0, 0, 14, 17, 17, 14, 2],
  r: [0, 0, 22, 25, 16, 16, 16],
  s: [0, 0, 15, 16, 14, 1, 30],
  t: [8, 8, 28, 8, 8, 9, 6],
  u: [0, 0, 17, 17, 17, 19, 13],
  v: [0, 0, 17, 17, 17, 10, 4],
  w: [0, 0, 17, 21, 21, 21, 10],
  x: [0, 0, 17, 10, 4, 10, 17],
  y: [0, 0, 17, 17, 17, 15, 1],
  z: [0, 0, 31, 2, 4, 8, 31],
  "0": [14, 17, 19, 21, 25, 17, 14],
  "1": [4, 12, 4, 4, 4, 4, 14],
  "2": [14, 17, 1, 6, 8, 16, 31],
  "3": [31, 2, 4, 2, 1, 17, 14],
  "4": [2, 6, 10, 18, 31, 2, 2],
  "5": [31, 16, 30, 1, 1, 17, 14],
  "6": [6, 8, 16, 30, 17, 17, 14],
  "7": [31, 1, 2, 4, 8, 8, 8],
  "8": [14, 17, 17, 14, 17, 17, 14],
  "9": [14, 17, 17, 15, 1, 2, 12],
  " ": [0, 0, 0, 0, 0, 0, 0],
  ".": [0, 0, 0, 0, 0, 12, 12],
  ",": [0, 0, 0, 0, 12, 4, 8],
  ":": [0, 12, 12, 0, 12, 12, 0],
  ";": [0, 12, 12, 0, 12, 4, 8],
  "!": [4, 4, 4, 4, 4, 0, 4],
  "?": [14, 17, 1, 2, 4, 0, 4],
  "'": [4, 4, 8, 0, 0, 0, 0],
  '"': [10, 10, 10, 0, 0, 0, 0],
  "-": [0, 0, 0, 31, 0, 0, 0],
  "(": [2, 4, 8, 8, 8, 4, 2],
  ")": [8, 4, 2, 2, 2, 4, 8],
  "/": [1, 1, 2, 4, 8, 16, 16],
  "%": [24, 25, 2, 4, 8, 19, 18],
  "&": [12, 18, 20, 8, 21, 18, 13],
  "+": [0, 4, 4, 31, 4, 4, 0],
  "=": [0, 0, 31, 0, 31, 0, 0],
  "*": [0, 20, 8, 14, 8, 20, 0],
  "#": [10, 10, 31, 10, 31, 10, 10],
  $: [4, 15, 20, 14, 5, 30, 4],
};

// ---------------------------------------------------------------- drawing

function setPixel(x: number, y: number, c: RGB): void {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}

function fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(W, x + w);
  const y1 = Math.min(H, y + h);
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      const i = (yy * W + xx) * 3;
      px[i] = c[0];
      px[i + 1] = c[1];
      px[i + 2] = c[2];
    }
  }
}

function strokeRect(x: number, y: number, w: number, h: number, c: RGB, t: number): void {
  fillRect(x, y, w, t, c);
  fillRect(x, y + h - t, w, t, c);
  fillRect(x, y, t, h, c);
  fillRect(x + w - t, y, t, h, c);
}

function hline(x: number, y: number, len: number, c: RGB, t = 1): void {
  fillRect(x, y, len, t, c);
}

function vline(x: number, y: number, len: number, c: RGB, t = 1): void {
  fillRect(x, y, t, len, c);
}

// Bresenham line.
function line(x0: number, y0: number, x1: number, y1: number, c: RGB): void {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    setPixel(x, y, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

function thickLine(x0: number, y0: number, x1: number, y1: number, c: RGB, t: number): void {
  for (let d = 0; d < t; d++) {
    line(x0, y0 + d, x1, y1 + d, c);
    line(x0 + d, y0, x1 + d, y1, c);
  }
}

function disc(cx: number, cy: number, r: number, c: RGB): void {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) setPixel(cx + x, cy + y, c);
    }
  }
}

function ring(cx: number, cy: number, r: number, c: RGB, t: number): void {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const d2 = x * x + y * y;
      if (d2 <= r * r && d2 > (r - t) * (r - t)) setPixel(cx + x, cy + y, c);
    }
  }
}

// Scanline fill for a simple polygon given as [x, y] points.
function fillPolygon(points: Array<readonly [number, number]>, c: RGB): void {
  let minY = H;
  let maxY = 0;
  for (const [, y] of points) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  for (let y = minY; y <= maxY; y++) {
    const xs: number[] = [];
    for (let i = 0; i < points.length; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[(i + 1) % points.length];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
        xs.push(Math.round(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0)));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      for (let x = xs[k]; x <= xs[k + 1]; x++) setPixel(x, y, c);
    }
  }
}

// ---------------------------------------------------------------- text

function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale;
}

function drawChar(x: number, y: number, ch: string, scale: number, c: RGB): void {
  const g = FONT[ch] ?? FONT["?"];
  for (let row = 0; row < 7; row++) {
    const bits = g[row];
    for (let col = 0; col < 5; col++) {
      if (bits & (1 << (4 - col))) {
        fillRect(x + col * scale, y + row * scale, scale, scale, c);
      }
    }
  }
}

function drawText(x: number, y: number, s: string, scale: number, c: RGB): void {
  let cx = x;
  for (const ch of s) {
    drawChar(cx, y, ch, scale, c);
    cx += 6 * scale;
  }
}

function drawTextCentered(cx: number, y: number, s: string, scale: number, c: RGB): void {
  drawText(cx - Math.floor(textWidth(s, scale) / 2), y, s, scale, c);
}

function wrapText(s: string, maxWidth: number, scale: number): string[] {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur === "" ? w : cur + " " + w;
    if (textWidth(test, scale) <= maxWidth) {
      cur = test;
    } else {
      if (cur !== "") lines.push(cur);
      cur = w;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}

// Draws a wrapped paragraph; returns the y just below the last line.
function drawPara(
  x: number,
  y: number,
  s: string,
  scale: number,
  c: RGB,
  maxWidth: number,
  leading: number,
): number {
  const lines = wrapText(s, maxWidth, scale);
  let yy = y;
  for (const ln of lines) {
    drawText(x, yy, ln, scale, c);
    yy += leading;
  }
  return yy;
}

// ---------------------------------------------------------------- PNG

const CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    px.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- pictures
// Small flat graphics, drawn with the primitives above.

function drawGlobe(cx: number, cy: number, r: number): void {
  disc(cx, cy, r, SEA);
  disc(cx - 18, cy - 16, 14, LAND);
  disc(cx + 16, cy - 4, 11, LAND);
  disc(cx - 4, cy + 20, 15, LAND);
  disc(cx + 24, cy + 18, 8, LAND);
  disc(cx - 26, cy + 6, 7, LAND);
  ring(cx, cy, r, NAVY, 3);
}

function drawBallotBox(cx: number, y: number, w: number, h: number): void {
  // Ballot paper sliding into the slot.
  fillPolygon(
    [
      [cx - 12, y],
      [cx + 24, y + 2],
      [cx + 18, y + 34],
      [cx - 18, y + 32],
    ],
    WHITE,
  );
  line(cx - 12, y, cx + 24, y + 2, INK);
  line(cx + 24, y + 2, cx + 18, y + 34, INK);
  line(cx + 18, y + 34, cx - 18, y + 32, INK);
  line(cx - 18, y + 32, cx - 12, y, INK);
  // Green tick on the paper.
  thickLine(cx - 6, y + 18, cx + 0, y + 24, LAND, 2);
  thickLine(cx + 0, y + 24, cx + 12, y + 8, LAND, 2);
  // The box.
  fillRect(cx - w / 2, y + 28, w, h - 28, NAVY);
  strokeRect(cx - w / 2, y + 28, w, h - 28, INK, 2);
  fillRect(cx - 34, y + 28, 68, 6, INK);
  drawTextCentered(cx, y + 28 + Math.floor((h - 28) / 2) - 7, "VOTE", 2, WHITE);
}

function drawPlane(x: number, y: number): void {
  // A jet in side view, flying right, with motion lines behind it.
  hline(x - 34, y + 16, 26, GREY, 2);
  hline(x - 26, y + 26, 18, GREY, 2);
  hline(x - 34, y + 36, 26, GREY, 2);
  fillPolygon(
    [
      [x, y + 20],
      [x + 100, y + 20],
      [x + 145, y + 28],
      [x + 100, y + 36],
      [x, y + 36],
    ],
    NAVY,
  );
  fillPolygon(
    [
      [x + 8, y + 20],
      [x + 24, y + 2],
      [x + 34, y + 20],
    ],
    NAVY,
  );
  fillPolygon(
    [
      [x + 55, y + 36],
      [x + 85, y + 52],
      [x + 98, y + 52],
      [x + 72, y + 36],
    ],
    NAVY,
  );
  fillRect(x + 108, y + 23, 18, 5, WHITE);
}

function drawSeismograph(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, SAND);
  strokeRect(x, y, w, h, INK, 1);
  const mid = y + Math.floor(h / 2);
  hline(x + 4, mid, w - 8, GREY, 1);
  const amps = [0, 1, -2, 3, -5, 9, -14, 20, -13, 8, -4, 2, -1, 0];
  const n = amps.length;
  for (let i = 0; i + 1 < n; i++) {
    const xa = x + 6 + Math.floor((i * (w - 12)) / (n - 1));
    const xb = x + 6 + Math.floor(((i + 1) * (w - 12)) / (n - 1));
    thickLine(xa, mid - amps[i], xb, mid - amps[i + 1], RED, 2);
  }
}

function drawCheckeredFlag(x: number, y: number, size: number): void {
  vline(x, y, size + 20, INK, 3);
  const fw = size;
  const fh = Math.floor(size * 0.7);
  const cols = 6;
  const rows = 4;
  const cw = Math.floor(fw / cols);
  const ch = Math.floor(fh / rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) {
        fillRect(x + 3 + c * cw, y + r * ch, cw, ch, INK);
      } else {
        fillRect(x + 3 + c * cw, y + r * ch, cw, ch, WHITE);
      }
    }
  }
  strokeRect(x + 3, y, fw, fh, INK, 1);
}

function drawRaceCar(x: number, y: number, w: number): void {
  // Rear wing.
  fillRect(x - 12, y + 2, 18, 5, INK);
  fillRect(x - 2, y + 7, 4, 12, INK);
  // Body.
  fillRect(x, y + 18, w, 16, RED);
  fillPolygon(
    [
      [x + w, y + 18],
      [x + w + 14, y + 26],
      [x + w, y + 34],
    ],
    RED,
  );
  // Cabin and window.
  fillRect(x + Math.floor(w * 0.34), y + 6, Math.floor(w * 0.3), 12, RED);
  fillRect(x + Math.floor(w * 0.4), y + 8, Math.floor(w * 0.18), 8, WHITE);
  // Wheels.
  disc(x + Math.floor(w * 0.22), y + 36, 10, INK);
  disc(x + Math.floor(w * 0.78), y + 36, 10, INK);
  disc(x + Math.floor(w * 0.22), y + 36, 4, GREY);
  disc(x + Math.floor(w * 0.78), y + 36, 4, GREY);
}

// ---------------------------------------------------------------- layout

function kicker(x: number, y: number, s: string): void {
  fillRect(x, y + 3, 8, 8, RED);
  drawText(x + 14, y, s, 2, RED);
}

function drawPage(): void {
  fillRect(0, 0, W, H, PAPER);
  strokeRect(10, 10, W - 20, H - 20, INK, 3);
  strokeRect(18, 18, W - 36, H - 36, INK, 1);

  // Top strip.
  drawText(28, 30, "SUNDAY EDITION", 2, INK);
  drawText(996 - textWidth("WORLD NEWS IN ONE PAGE", 2), 30, "WORLD NEWS IN ONE PAGE", 2, INK);
  hline(28, 48, 968, INK, 1);

  // Masthead.
  drawTextCentered(512, 56, "THE WORLD TODAY", 8, INK);

  // Date bar.
  fillRect(28, 120, 968, 34, INK);
  drawTextCentered(512, 126, "SUNDAY 22 NOVEMBER 2026", 3, WHITE);
  hline(28, 162, 968, INK, 2);

  // ---- Lead story: COP31 (left column).
  kicker(28, 172, "CLIMATE SUMMIT - ANTALYA, TURKEY");
  drawText(28, 196, "CLIMATE TALKS", 5, INK);
  drawText(28, 240, "NEAR A DEAL", 5, INK);
  drawText(28, 284, "AFTER LONG NIGHT", 5, INK);
  drawGlobe(595, 232, 52);
  drawPara(
    28,
    340,
    "Negotiators in Antalya worked past their Friday deadline and through Saturday night. Early on Sunday the COP31 president tabled a new text and called a vote for Sunday morning. Fossil fuels and finance for poorer nations remain the hard points.",
    2,
    INK,
    620,
    21,
  );
  fillRect(28, 458, 620, 34, SAND);
  strokeRect(28, 458, 620, 34, INK, 1);
  drawTextCentered(338, 466, "NEW TEXT TABLED EARLY SUNDAY - VOTE DUE 0600 GMT", 2, INK);

  // Divider between the two top columns.
  vline(656, 172, 340, INK, 1);

  // ---- Hong Kong (right column).
  kicker(668, 172, "HONG KONG");
  drawText(668, 196, "HONG KONG", 4, INK);
  drawText(668, 230, "VOTES FOR ITS", 4, INK);
  drawText(668, 264, "ELECTION BODY", 4, INK);
  drawBallotBox(832, 306, 168, 80);
  drawPara(
    668,
    396,
    "Voters cast ballots from 9am to 6pm for 723 seats. The 1,500-strong Election Committee picks Hong Kong's next leader.",
    2,
    INK,
    328,
    21,
  );

  hline(28, 530, 968, INK, 2);

  // ---- Nepal PM in India (full width band).
  kicker(28, 542, "NEPAL - INDIA");
  drawText(28, 566, "NEPAL PM LANDS IN DELHI", 4, INK);
  drawText(28, 600, "FOR FIRST STATE VISIT", 4, INK);
  drawPlane(830, 552);
  drawPara(
    28,
    642,
    "Balendra Shah arrived in New Delhi on Sunday for a two-day state visit, his first since taking office in March. He meets Narendra Modi on Monday to talk flood aid, energy, trade and a possible $2 billion package.",
    2,
    INK,
    968,
    21,
  );

  hline(28, 716, 968, INK, 2);

  // ---- Myanmar quake (bottom left).
  kicker(28, 728, "EARTHQUAKE");
  drawText(28, 752, "QUAKE SHAKES MYANMAR", 3, INK);
  drawText(28, 779, "IN THE NIGHT", 3, INK);
  drawSeismograph(28, 812, 330, 48);
  drawText(372, 822, "M 4.1", 4, RED);
  drawPara(
    28,
    872,
    "A magnitude 4.1 quake struck Myanmar at 2:35am local time, 95 km deep. No damage or injuries were reported.",
    2,
    INK,
    472,
    21,
  );

  vline(512, 728, 222, INK, 1);

  // ---- Formula 1 (bottom right).
  kicker(524, 728, "FORMULA 1 - RACE DAY");
  drawText(524, 752, "VERSTAPPEN ON POLE", 3, INK);
  drawText(524, 779, "IN VEGAS", 3, INK);
  drawCheckeredFlag(524, 812, 72);
  drawRaceCar(640, 812, 180);
  drawPara(
    524,
    872,
    "The Las Vegas Grand Prix runs today. Verstappen starts on pole after Antonelli, fastest in qualifying, took a five-place grid penalty.",
    2,
    INK,
    472,
    21,
  );

  // ---- Footer.
  hline(28, 968, 968, INK, 1);
  drawTextCentered(512, 976, "ALL FIVE STORIES VERIFIED FROM WIRE REPORTS", 2, GREY);
}

// ---------------------------------------------------------------- main

function main(): void {
  drawPage();
  const png = encodePNG();
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.png", png);
}

main();
