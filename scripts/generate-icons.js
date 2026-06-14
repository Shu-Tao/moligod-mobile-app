/**
 * 生成 Moligod 应用图标脚本
 * 用法: node scripts/generate-icons.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ========== PNG 编码 (纯 Node.js, 无外部依赖) ==========
const crcTable = [];
function makeCRCTable() {
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
}
makeCRCTable();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 255] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

function createPNG(width, height, rgbaData) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Raw image data with filter byte per row
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (width * 4 + 1) + 1 + x * 4;
      rawData[dstIdx] = rgbaData[srcIdx];
      rawData[dstIdx + 1] = rgbaData[srcIdx + 1];
      rawData[dstIdx + 2] = rgbaData[srcIdx + 2];
      rawData[dstIdx + 3] = rgbaData[srcIdx + 3];
    }
  }
  const idat = zlib.deflateSync(rawData);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ========== 绘制圆形渐变图标 "M" ==========
function drawIcon(size, bgColor, fgColor1, fgColor2) {
  const data = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.48;

  // Parse hex colors to RGB
  const bgR = parseInt(bgColor.slice(1, 3), 16);
  const bgG = parseInt(bgColor.slice(3, 5), 16);
  const bgB = parseInt(bgColor.slice(5, 7), 16);

  const fgR1 = parseInt(fgColor1.slice(1, 3), 16);
  const fgG1 = parseInt(fgColor1.slice(3, 5), 16);
  const fgB1 = parseInt(fgColor1.slice(5, 7), 16);

  const fgR2 = parseInt(fgColor2.slice(1, 3), 16);
  const fgG2 = parseInt(fgColor2.slice(3, 5), 16);
  const fgB2 = parseInt(fgColor2.slice(5, 7), 16);

  // Draw circular gradient background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Inside circle - draw gradient
        const t = dist / radius;
        // Anti-aliasing on edge
        let alpha = 1;
        if (dist > radius - 2) {
          alpha = (radius - dist) / 2;
        }

        // Gradient from cyan to green
        const r = Math.round(fgR1 * (1 - t) + fgR2 * t);
        const g = Math.round(fgG1 * (1 - t) + fgG2 * t);
        const b = Math.round(fgB1 * (1 - t) + fgB2 * t);

        data[idx] = Math.round(bgR * (1 - alpha * 0.2) + (bgR) * alpha * 0.2);
        data[idx + 1] = Math.round(bgG * (1 - alpha * 0.2) + (bgG) * alpha * 0.2);
        data[idx + 2] = Math.round(bgB * (1 - alpha * 0.2) + (bgB) * alpha * 0.2);
        data[idx + 3] = 255;

        // Inner ring
        const innerRadius = radius - size * 0.08;
        if (dist <= innerRadius) {
          let innerAlpha = 1;
          if (dist > innerRadius - 2) {
            innerAlpha = (innerRadius - dist) / 2;
          }
          const it = dist / innerRadius;
          const ir = Math.round(fgR1 * (1 - it) + fgR2 * it);
          const ig = Math.round(fgG1 * (1 - it) + fgG2 * it);
          const ib = Math.round(fgB1 * (1 - it) + fgB2 * it);
          data[idx] = bgR;
          data[idx + 1] = bgG;
          data[idx + 2] = bgB;
          data[idx + 3] = 255;
        } else {
          // Ring area with gradient border
          data[idx] = Math.round(fgR1 * (1 - t) + fgR2 * t);
          data[idx + 1] = Math.round(fgG1 * (1 - t) + fgG2 * t);
          data[idx + 2] = Math.round(fgB1 * (1 - t) + fgB2 * t);
          data[idx + 3] = 255;
        }
      } else {
        // Transparent outside
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 0;
      }
    }
  }

  // Draw the letter "M" in the center
  const mSize = Math.floor(size * 0.45);
  const mTop = Math.floor((size - mSize) / 2);
  const mLeft = Math.floor((size - mSize) / 2);
  const strokeWidth = Math.max(2, Math.floor(size * 0.08));

  // Simple "M" character drawing
  const letterPoints = [];
  // M: vertical lines and two diagonals
  // Left vertical: x = mLeft, y = mTop to mTop+mSize
  for (let y = mTop; y < mTop + mSize; y++) {
    for (let s = 0; s < strokeWidth; s++) {
      letterPoints.push([mLeft + s, y]);
      letterPoints.push([mLeft + mSize - 1 - s, y]);
    }
  }
  // Two diagonal lines forming the "M"
  for (let i = 0; i < mSize; i++) {
    const midLeft = mLeft + Math.floor(mSize * 0.25);
    const midRight = mLeft + Math.floor(mSize * 0.75);
    const mid = mLeft + Math.floor(mSize / 2);
    // Left diagonal: from top-left to middle-bottom
    const diag1X = mLeft + Math.floor(i * 0.5);
    const diag1Y = mTop + i;
    // Right diagonal: from top-right to middle-bottom
    const diag2X = mLeft + mSize - 1 - Math.floor(i * 0.5);
    const diag2Y = mTop + i;
    // Middle upward diagonal
    for (let s = 0; s < strokeWidth; s++) {
      letterPoints.push([diag1X + s, diag1Y]);
      letterPoints.push([diag2X - s, diag2Y]);
      // Vertical middle stems
      letterPoints.push([mid + s - Math.floor(strokeWidth / 2), mTop + i]);
    }
  }

  // Apply letter pixels with gradient color
  for (const [px, py] of letterPoints) {
    if (px >= 0 && px < size && py >= 0 && py < size) {
      const idx = (py * size + px) * 4;
      const t = py / size;
      data[idx] = Math.round(fgR1 * (1 - t) + fgR2 * t);
      data[idx + 1] = Math.round(fgG1 * (1 - t) + fgG2 * t);
      data[idx + 2] = Math.round(fgB1 * (1 - t) + fgB2 * t);
      data[idx + 3] = 255;
    }
  }

  return data;
}

function saveIcon(filePath, size, bgColor, fgColor1, fgColor2) {
  const data = drawIcon(size, bgColor, fgColor1, fgColor2);
  const png = createPNG(size, size, data);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, png);
  console.log(`  ✓ ${path.basename(filePath)} (${size}x${size})`);
}

// ========== 主程序 ==========
const rootDir = path.resolve(__dirname, '..');

console.log('\n=== 生成 Android 图标 ===');
const iconSizes = [
  { size: 48, folder: 'mipmap-mdpi' },
  { size: 72, folder: 'mipmap-hdpi' },
  { size: 96, folder: 'mipmap-xhdpi' },
  { size: 144, folder: 'mipmap-xxhdpi' },
  { size: 192, folder: 'mipmap-xxxhdpi' },
];

for (const { size, folder } of iconSizes) {
  const dir = path.join(rootDir, 'android/app/src/main/res', folder);
  saveIcon(path.join(dir, 'ic_launcher.png'), size, '#0a0e17', '#00d4ff', '#00ff88');
  saveIcon(path.join(dir, 'ic_launcher_round.png'), size, '#0a0e17', '#00d4ff', '#00ff88');
}

console.log('\n=== 生成 Web 图标 ===');
const webDir = path.join(rootDir, 'web/assets/icons');
saveIcon(path.join(webDir, 'icon-192.png'), 192, '#0a0e17', '#00d4ff', '#00ff88');
saveIcon(path.join(webDir, 'icon-512.png'), 512, '#0a0e17', '#00d4ff', '#00ff88');
saveIcon(path.join(webDir, 'favicon-16.png'), 16, '#0a0e17', '#00d4ff', '#00ff88');
saveIcon(path.join(webDir, 'favicon-32.png'), 32, '#0a0e17', '#00d4ff', '#00ff88');

// Generate splash
console.log('\n=== 生成启动图 ===');
saveIcon(path.join(webDir, 'splash.png'), 512, '#0a0e17', '#00d4ff', '#00ff88');

console.log('\n✅ 所有图标生成完成！');
