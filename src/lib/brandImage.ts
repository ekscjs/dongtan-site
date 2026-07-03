import sharp, { type OverlayOptions } from "sharp";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * 업로드 이미지 자동 브랜딩 — 하단 로고 푸터(항상) + 제목 오버레이(옵션).
 * 블로그팀/scripts/brand_image.mjs(brand_image.py Node 포트)와 동일한 스타일.
 *
 * 폰트는 시스템에 설치된 이름(font-family)으로 찾지 않고 파일을 base64로 직접 SVG에 임베드한다.
 * 서버 프로세스(Next dev/Vercel 등)가 OS 폰트 목록을 못 찾는 환경이 있어(로컬 Windows에서 실측),
 * @font-face + data URI로 박아 넣어야 어떤 배포 환경에서도 한글이 항상 그려진다.
 */

const PRIMARY = "#2C5F5A";
const CREAM = "#F5EFE6";
const WHITE = "#FFFFFF";
const MAXW = 1600;
const FONT = "NotoSansKR";

let fontDataUri: string | null = null;
function getFontFace(): string {
  if (!fontDataUri) {
    const bytes = readFileSync(join(process.cwd(), "src", "lib", "fonts", "NotoSansKR-VF.ttf"));
    fontDataUri = `data:font/ttf;base64,${bytes.toString("base64")}`;
  }
  return `<style>@font-face { font-family: '${FONT}'; src: url(${fontDataUri}) format('truetype'); }</style>`;
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// 한글(CJK)은 폰트크기와 거의 1:1, 영문/숫자는 절반 정도로 너비 추정
function estWidth(str: string, fontSize: number) {
  let w = 0;
  for (const ch of str) w += /[ㄱ-힝一-鿿]/.test(ch) ? fontSize : fontSize * 0.55;
  return w;
}

function wrapTitle(title: string, fontSize: number, maxWidth: number) {
  const lines: string[] = [];
  let cur = "";
  for (const tok of title.split(" ")) {
    const candidate = (cur + " " + tok).trim();
    if (estWidth(candidate, fontSize) <= maxWidth) cur = candidate;
    else { if (cur) lines.push(cur); cur = tok; }
  }
  if (cur) lines.push(cur);
  return lines;
}

export interface BrandImageOptions {
  title?: string; // 있으면 상단 제목 오버레이 추가
  png?: boolean; // true면 PNG로 출력(기본 JPEG)
}

export async function brandImage(input: Buffer, opts: BrandImageOptions = {}): Promise<Buffer> {
  let img = sharp(input).rotate(); // EXIF 회전 보정
  const meta = await img.metadata();
  let w = meta.width ?? 0;
  let h = meta.height ?? 0;

  if (w > MAXW) {
    const nh = Math.round((h * MAXW) / w);
    img = img.resize(MAXW, nh);
    w = MAXW;
    h = nh;
  }

  const base = await img.toBuffer();
  const footH = Math.max(44, Math.floor(w / 22));
  const totalH = h + footH;
  const layers: OverlayOptions[] = [{ input: base, top: 0, left: 0 }];

  // 하단 로고 푸터 — 항상 적용
  const footFontSize = Math.floor(footH * 0.42);
  const footText = "내몸에미소 · bodymiso.com";
  const footTextW = estWidth(footText, footFontSize);
  const footSvg = `
    <svg width="${w}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
      ${getFontFace()}
      <rect x="0" y="${h}" width="${w}" height="${footH}" fill="${CREAM}"/>
      <text x="${w - footTextW - w * 0.03}" y="${h + footH / 2 + footFontSize * 0.35}"
            font-family="${FONT}" font-size="${footFontSize}" font-weight="700" fill="${PRIMARY}">${escapeXml(footText)}</text>
    </svg>`;
  layers.push({ input: Buffer.from(footSvg), top: 0, left: 0 });

  // 상단 제목 오버레이 — 옵션
  if (opts.title) {
    const bandH = Math.floor(h * 0.34);
    const titleFontSize = Math.max(30, Math.floor(w / 22));
    const lines = wrapTitle(opts.title, titleFontSize, w * 0.88);
    const lineHeight = titleFontSize * 1.25;
    let gradientStops = "";
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const yPct = (i / steps) * 100;
      const alpha = 0.59 * (1 - i / steps);
      gradientStops += `<stop offset="${yPct}%" stop-color="rgb(20,30,28)" stop-opacity="${alpha.toFixed(3)}"/>`;
    }
    let textEls = "";
    let ty = h * 0.03 + titleFontSize;
    for (const ln of lines) {
      const tx = w * 0.04;
      textEls += `
        <text x="${tx + 2}" y="${ty + 2}" font-family="${FONT}" font-size="${titleFontSize}" font-weight="700" fill="#000000">${escapeXml(ln)}</text>
        <text x="${tx}" y="${ty}" font-family="${FONT}" font-size="${titleFontSize}" font-weight="700" fill="${WHITE}">${escapeXml(ln)}</text>`;
      ty += lineHeight;
    }
    const titleSvg = `
      <svg width="${w}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
        ${getFontFace()}
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            ${gradientStops}
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${w}" height="${bandH}" fill="url(#g)"/>
        ${textEls}
      </svg>`;
    layers.push({ input: Buffer.from(titleSvg), top: 0, left: 0 });
  }

  const composed = sharp({ create: { width: w, height: totalH, channels: 3, background: CREAM } }).composite(layers);
  return opts.png ? composed.png().toBuffer() : composed.jpeg({ quality: 90 }).toBuffer();
}
