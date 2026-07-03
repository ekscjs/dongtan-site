import sharp, { type OverlayOptions } from "sharp";
import { Resvg } from "@resvg/resvg-js";
import { join } from "path";

/**
 * 업로드 이미지 자동 브랜딩 — 하단 로고 푸터(항상) + 제목 오버레이(옵션).
 * 블로그팀/scripts/brand_image.mjs(brand_image.py Node 포트)와 동일한 스타일.
 *
 * 텍스트가 들어간 레이어는 sharp(libvips/librsvg)가 아니라 @resvg/resvg-js로 직접
 * PNG 래스터화한다. sharp의 SVG 로더는 플랫폼(Vercel Linux)에서 @font-face 임베드
 * 폰트를 지원하지 않아 텍스트가 통째로 사라지는 문제가 실측되었다(로컬 Windows에서는
 * 정상 렌더링됨) — resvg는 fontFiles 옵션으로 폰트 파일을 직접 지정해 시스템
 * fontconfig 유무와 무관하게 모든 플랫폼에서 동일하게 렌더링된다.
 *
 * 폰트는 가변 폰트(Variable Font)가 아니라 정적 Bold 폰트 파일을 쓴다 — resvg가
 * 가변 폰트의 font-weight/font-variation-settings(wght 축)를 반영하지 않아
 * 항상 가장 얇은 인스턴스로만 그려지는 문제가 실측되었다(굵기 400/700 렌더링 결과
 * 완전히 동일). 파이썬 버전(brand_image.py)도 같은 이유로 Bold 전용 폰트 파일을
 * 별도로 썼다.
 */

const PRIMARY = "#2C5F5A";
const CREAM = "#F5EFE6";
const WHITE = "#FFFFFF";
const MAXW = 1600;
const FONT = "NotoSansKR-Bold";
const FONT_PATH = join(process.cwd(), "src", "lib", "fonts", "NotoSansKR-Bold.ttf");

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// 한글(CJK)은 폰트크기와 거의 1:1, 영문/숫자는 절반 정도로 너비 추정
function estWidth(str: string, fontSize: number) {
  let w = 0;
  for (const ch of str) w += /[ㄱ-힝一-鿿]/.test(ch) ? fontSize : fontSize * 0.55;
  return w;
}

// 단어(공백) 단위로만 줄바꿈 — 한글 단어 중간에서 끊지 않는다. maxLines를 넘으면
// 잘라내고 마지막 줄 끝에 말줄임표(…)를 붙인다.
function wrapTitle(title: string, fontSize: number, maxWidth: number, maxLines: number) {
  const words = title.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const tok of words) {
    const candidate = cur ? `${cur} ${tok}` : tok;
    if (estWidth(candidate, fontSize) <= maxWidth) cur = candidate;
    else { if (cur) lines.push(cur); cur = tok; }
  }
  if (cur) lines.push(cur);

  if (lines.length <= maxLines) return lines;
  const truncated = lines.slice(0, maxLines);
  truncated[maxLines - 1] = `${truncated[maxLines - 1]}…`;
  return truncated;
}

// SVG(텍스트 포함)를 resvg로 직접 래스터화 — 플랫폼 무관하게 폰트 파일을 강제 사용
function renderSvgToPng(svg: string): Buffer {
  const resvg = new Resvg(svg, {
    font: { fontFiles: [FONT_PATH], loadSystemFonts: false, defaultFontFamily: FONT },
  });
  return resvg.render().asPng();
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
      <rect x="0" y="${h}" width="${w}" height="${footH}" fill="${CREAM}"/>
      <text x="${w - footTextW - w * 0.03}" y="${h + footH / 2 + footFontSize * 0.35}"
            font-family="${FONT}" font-size="${footFontSize}" font-weight="700" fill="${PRIMARY}">${escapeXml(footText)}</text>
    </svg>`;
  layers.push({ input: renderSvgToPng(footSvg), top: 0, left: 0 });

  // 상단 제목 오버레이 — 옵션 (최대 2줄, 단어 단위 줄바꿈)
  if (opts.title) {
    const titleFontSize = Math.max(34, Math.floor(w / 16));
    const lines = wrapTitle(opts.title, titleFontSize, w * 0.88, 2);
    const lineHeight = titleFontSize * 1.25;
    const topPad = h * 0.03;
    const bandH = Math.min(h, Math.round(topPad + lines.length * lineHeight + titleFontSize * 0.35));
    let gradientStops = "";
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const yPct = (i / steps) * 100;
      const alpha = Math.max(0.18, 0.82 * (1 - i / steps));
      gradientStops += `<stop offset="${yPct}%" stop-color="rgb(10,16,15)" stop-opacity="${alpha.toFixed(3)}"/>`;
    }
    let textEls = "";
    let ty = topPad + titleFontSize;
    for (const ln of lines) {
      const tx = w * 0.04;
      textEls += `
        <text x="${tx + 2}" y="${ty + 2}" font-family="${FONT}" font-size="${titleFontSize}" font-weight="700" fill="#000000">${escapeXml(ln)}</text>
        <text x="${tx}" y="${ty}" font-family="${FONT}" font-size="${titleFontSize}" font-weight="700" fill="${WHITE}">${escapeXml(ln)}</text>`;
      ty += lineHeight;
    }
    const titleSvg = `
      <svg width="${w}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            ${gradientStops}
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${w}" height="${bandH}" fill="url(#g)"/>
        ${textEls}
      </svg>`;
    layers.push({ input: renderSvgToPng(titleSvg), top: 0, left: 0 });
  }

  const composed = sharp({ create: { width: w, height: totalH, channels: 3, background: CREAM } }).composite(layers);
  return opts.png ? composed.png().toBuffer() : composed.jpeg({ quality: 90 }).toBuffer();
}
