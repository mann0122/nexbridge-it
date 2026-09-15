/**
 * Renders the animated NexBridge-IT signature lockup and encodes it to GIF.
 *
 * Frame 0 is the finished lockup on purpose: Outlook for Windows shows only
 * the first frame of a GIF, so the still must already be the brand asset.
 * Everywhere else a light sweep crosses the plate once per loop.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const REPO = 'C:/Users/manus/Projects/nexbridge-it';
const OUT = 'C:/Users/manus/AppData/Local/Temp/nbcard/sig';
const FRAMES = path.join(OUT, 'frames');
fs.mkdirSync(FRAMES, { recursive: true });

const archivo = fs
  .readFileSync(path.join(REPO, 'website/node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'))
  .toString('base64');

// canonical mark paths (public/logo-mark.svg), origin-normalized
const MARK = fs.readFileSync(path.join(REPO, 'website/public/logo-mark.svg'), 'utf8');
const inner = MARK.match(/<g transform[\s\S]*<\/g>/)[0];

const W = 560, H = 128; // 2x of the 280x64 display size
const N = 30;           // frames
const FPS = 15;         // 2s loop

const page = (t) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:'Archivo Variable';font-weight:100 900;font-stretch:62.5% 125%;
  src:url(data:font/woff2;base64,${archivo}) format('woff2-variations');}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;background:transparent}
.plate{position:relative;width:${W}px;height:${H}px;overflow:hidden;border-radius:12px;
  background:#14171A;display:flex;align-items:center;gap:26px;padding:0 34px;
  font-family:'Archivo Variable',sans-serif}
.mark{width:104px;height:auto;flex:none;display:block}
.wm{font-size:40px;font-weight:600;font-stretch:112%;letter-spacing:-0.01em;color:#F7F5F0;line-height:1}
.dot{color:#FF4D00}
.sheen{position:absolute;top:-40%;left:0;width:38%;height:180%;pointer-events:none;
  background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.16) 50%,rgba(255,255,255,0) 100%);
  transform:translateX(${t}px) rotate(14deg)}
</style>
<div class="plate">
  <svg class="mark" viewBox="0 0 1145.06 676.8" xmlns="http://www.w3.org/2000/svg">${inner}</svg>
  <span class="wm">NexBridge-IT<span class="dot">.</span></span>
  <span class="sheen"></span>
</div>`;

(async () => {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--force-device-scale-factor=1'],
  });
  const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

  for (let i = 0; i < N; i++) {
    // sheen rests off-plate for the first third, then crosses once
    const u = i / N;
    const travel = u < 0.34 ? -W : -W + ((u - 0.34) / 0.66) * (W * 2.1);
    await p.setContent(page(Math.round(travel)), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({
      path: path.join(FRAMES, `f${String(i).padStart(3, '0')}.png`),
      omitBackground: true,
    });
  }
  await b.close();

  const gif = path.join(OUT, 'nb-signature.gif');
  const pal = path.join(OUT, 'palette.png');
  const inPat = path.join(FRAMES, 'f%03d.png');
  execSync(`ffmpeg -y -v error -framerate ${FPS} -i "${inPat}" -vf "palettegen=stats_mode=diff" "${pal}"`);
  execSync(
    `ffmpeg -y -v error -framerate ${FPS} -i "${inPat}" -i "${pal}" ` +
      `-lavfi "paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" -loop 0 "${gif}"`
  );
  console.log('GIF:', gif, Math.round(fs.statSync(gif).size / 1024) + ' KB');

  // a static PNG twin for clients that block GIFs entirely
  fs.copyFileSync(path.join(FRAMES, 'f000.png'), path.join(OUT, 'nb-signature.png'));
  console.log('PNG still:', Math.round(fs.statSync(path.join(OUT, 'nb-signature.png')).size / 1024) + ' KB');
})().catch((e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
