// Genera la imagen del comando /ship usando assets/ship.jpg como fondo.
const path = require('node:path');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

const ASSETS = path.join(__dirname, '..', '..', 'assets');
try { GlobalFonts.registerFromPath(path.join(ASSETS, 'font.ttf'), 'ShipFont'); } catch {}
const FONT = 'ShipFont, sans-serif';

let bgPromise;
const getBackground = () => (bgPromise ??= loadImage(path.join(ASSETS, 'ship.jpg')));

async function fetchImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar el avatar (${res.status})`);
  return loadImage(Buffer.from(await res.arrayBuffer()));
}

function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.5);
  ctx.bezierCurveTo(x - s * 1.1, y - s * 0.1, x - s * 0.55, y - s * 0.75, x, y - s * 0.25);
  ctx.bezierCurveTo(x + s * 0.55, y - s * 0.75, x + s * 1.1, y - s * 0.1, x, y + s * 0.5);
  ctx.closePath();
}

function avatar(ctx, img, cx, cy, r) {
  ctx.save();
  ctx.shadowColor = '#d946ef';
  ctx.shadowBlur = 35;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
  ctx.fillStyle = '#e879f9';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function glowText(ctx, text, x, y, size, maxWidth) {
  ctx.save();
  ctx.font = `bold ${size}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#d946ef';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

/**
 * @param {{userA: import('discord.js').User, userB: import('discord.js').User, nameA: string, nameB: string, percent: number}} o
 * @returns {Promise<Buffer>} PNG
 */
async function renderShip({ userA, userB, nameA, nameB, percent }) {
  const W = 1200, H = 480;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  const bg = await getBackground();
  const scale = Math.max(W / bg.width, H / bg.height);
  ctx.drawImage(bg, (W - bg.width * scale) / 2, (H - bg.height * scale) / 2, bg.width * scale, bg.height * scale);

  const opts = { extension: 'png', size: 256, forceStatic: true };
  const [imgA, imgB] = await Promise.all([
    fetchImage(userA.displayAvatarURL(opts)),
    fetchImage(userB.displayAvatarURL(opts)),
  ]);
  avatar(ctx, imgA, 190, 195, 105);
  avatar(ctx, imgB, 1010, 195, 105);
  glowText(ctx, nameA, 190, 345, 30, 300);
  glowText(ctx, nameB, 1010, 345, 30, 300);

  // Corazón con porcentaje
  ctx.save();
  const grad = ctx.createLinearGradient(540, 150, 660, 290);
  grad.addColorStop(0, '#f472b6');
  grad.addColorStop(1, '#a855f7');
  ctx.shadowColor = '#e879f9';
  ctx.shadowBlur = 30;
  heartPath(ctx, 600, 232, 105);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
  glowText(ctx, `${percent}%`, 600, 232, 54, 130);

  // Barra de amor
  const bx = 320, by = 398, bw = 560, bh = 28;
  ctx.save();
  roundRect(ctx, bx, by, bw, bh, 14);
  ctx.fillStyle = 'rgba(20, 5, 40, 0.75)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#e879f9';
  ctx.stroke();
  if (percent > 0) {
    const fillW = Math.max(bh, (bw * percent) / 100);
    roundRect(ctx, bx, by, fillW, bh, 14);
    const barGrad = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    barGrad.addColorStop(0, '#a855f7');
    barGrad.addColorStop(1, '#f472b6');
    ctx.fillStyle = barGrad;
    ctx.shadowColor = '#e879f9';
    ctx.shadowBlur = 16;
    ctx.fill();
  }
  ctx.restore();

  return canvas.toBuffer('image/png');
}

module.exports = { renderShip };
