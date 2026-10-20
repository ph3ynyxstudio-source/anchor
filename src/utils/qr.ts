/**
 * Zero-dependency QR Code generator (Model 2, Byte Mode, ECC Level L/M).
 * Generates an SVG string representation of the QR code for local Wi-Fi pairing.
 */

// Galois Field GF(256) tables for Reed-Solomon coding
const GF_EXP: number[] = new Array(512);
const GF_LOG: number[] = new Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_EXP[i + 255] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 256) {
      x ^= 0x11d; // generator polynomial x^8 + x^4 + x^3 + x^2 + 1
    }
  }
  GF_LOG[0] = 0;
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = [1, GF_EXP[i]];
    const res = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      for (let k = 0; k < next.length; k++) {
        res[j + k] ^= gfMul(poly[j], next[k]);
      }
    }
    poly = res;
  }
  return poly;
}

function rsCalculateEc(data: number[], ecCount: number): number[] {
  const gen = rsGeneratorPoly(ecCount);
  const msg = [...data, ...new Array(ecCount).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return msg.slice(data.length);
}

// Version table for byte mode (Version 1-4, Level M)
// Version 1: 21x21, 14 data bytes, 10 EC bytes
// Version 2: 25x25, 26 data bytes, 16 EC bytes
// Version 3: 29x29, 42 data bytes, 26 EC bytes
// Version 4: 33x33, 62 data bytes, 36 EC bytes (holds up to 60 chars)
// Version 5: 37x37, 84 data bytes, 48 EC bytes
interface VersionInfo {
  version: number;
  size: number;
  dataBytes: number;
  ecBytes: number;
  alignment: number[];
}

const VERSIONS: VersionInfo[] = [
  { version: 1, size: 21, dataBytes: 16, ecBytes: 7, alignment: [] }, // Level L
  { version: 2, size: 25, dataBytes: 28, ecBytes: 10, alignment: [6, 18] },
  { version: 3, size: 29, dataBytes: 44, ecBytes: 15, alignment: [6, 22] },
  { version: 4, size: 33, dataBytes: 64, ecBytes: 20, alignment: [6, 26] },
  { version: 5, size: 37, dataBytes: 86, ecBytes: 26, alignment: [6, 30] },
];

export function generateQrMatrix(text: string): boolean[][] {
  const rawBytes = new TextEncoder().encode(text);
  const dataLen = rawBytes.length;

  const ver = VERSIONS.find((v) => v.dataBytes >= dataLen + 2) || VERSIONS[VERSIONS.length - 1];
  const size = ver.size;

  // 1. Bitstream generation: Mode indicator (0100 for Byte mode) + Character count (8 bits) + payload
  const bits: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode
  pushBits(dataLen, 8); // 8-bit count for versions 1-9
  for (const b of rawBytes) {
    pushBits(b, 8);
  }

  // Terminator (up to 4 zero bits)
  const remainingDataBits = ver.dataBytes * 8 - bits.length;
  const termLen = Math.min(4, Math.max(0, remainingDataBits));
  pushBits(0, termLen);

  // Pad to multiple of 8
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Pad bytes (0xEC, 0x11)
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < ver.dataBytes * 8) {
    pushBits(padPatterns[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to data bytes
  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i + j];
    }
    dataBytes.push(b);
  }

  // Calculate Reed-Solomon Error Correction
  const ecBytes = rsCalculateEc(dataBytes, ver.ecBytes);
  const totalStream = [...dataBytes, ...ecBytes];

  // 2. Initialize matrix & reserved masks
  const matrix: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  function setModule(r: number, c: number, val: boolean, isReserved = true) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      if (isReserved) reserved[r][c] = true;
    }
  }

  // Finder patterns (top-left, top-right, bottom-left)
  function drawFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const mr = row + r;
        const mc = col + c;
        if (mr >= 0 && mr < size && mc >= 0 && mc < size) {
          const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          setModule(mr, mc, inOuter && (isBorder || inInner));
        }
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Alignment patterns
  if (ver.alignment.length >= 2) {
    const coords = ver.alignment;
    for (const r of coords) {
      for (const c of coords) {
        if (reserved[r][c]) continue; // Skip finder overlapping
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            setModule(r + dr, c + dc, isBorder || isCenter);
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setModule(6, i, i % 2 === 0);
    setModule(i, 6, i % 2 === 0);
  }

  // Dark module
  setModule(4 * ver.version + 9, 8, true);

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (!reserved[8][i]) reserved[8][i] = true;
    if (!reserved[i][8]) reserved[i][8] = true;
  }
  for (let i = size - 8; i < size; i++) {
    if (!reserved[8][i]) reserved[8][i] = true;
    if (!reserved[i][8]) reserved[i][8] = true;
  }

  // Place data bits in zig-zag pattern
  const allBits: number[] = [];
  for (const byte of totalStream) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((byte >> i) & 1);
    }
  }

  let bitIdx = 0;
  let upwards = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing pattern

    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of [right, right - 1]) {
        if (!reserved[r][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          // Apply mask pattern 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = (bit === 1) !== mask;
        }
      }
    }
    upwards = !upwards;
  }

  // Format bits for Mask 0 and Error Correction L (01)
  // Format string for (L, 0) with BCH error correction and XOR mask 0x5412: 0x77C4 (111011111000100)
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];

  // Top-left format placement
  const tlCoords: [number, number][] = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
    [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8],
    [2, 8], [1, 8], [0, 8]
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = tlCoords[i];
    matrix[r][c] = formatBits[i] === 1;
  }

  // Split format placement (around other finders)
  for (let i = 0; i < 7; i++) {
    matrix[size - 1 - i][8] = formatBits[i] === 1;
  }
  for (let i = 7; i < 15; i++) {
    matrix[8][size - 15 + i] = formatBits[i] === 1;
  }

  return matrix;
}

export function generateQrSvg(text: string, size = 180): string {
  const matrix = generateQrMatrix(text);
  const count = matrix.length;
  const padding = 2; // quiet zone
  const total = count + padding * 2;
  const cellSize = size / total;

  let rects = "";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (matrix[r][c]) {
        const x = (c + padding) * cellSize;
        const y = (r + padding) * cellSize;
        rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="#2C2A29" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#F7F3E9"/>${rects}</svg>`;
}
