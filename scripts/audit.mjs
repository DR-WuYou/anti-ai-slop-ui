#!/usr/bin/env node
/**
 * anti-ai-slop-ui · 静态体检
 * 抓 12 类可量化的"AI 味"表症，给出 0–100 分。
 * 零依赖，只读不写。Node >= 18。
 *
 *   node scripts/audit.mjs .
 *   node scripts/audit.mjs src --json
 *   node scripts/audit.mjs . --fail-under 85
 */
import { readdir, readFile, stat as statFn } from 'node:fs/promises';
import path from 'node:path';

const VERSION = '1.0.0';
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.turbo', 'out', '.output', '.vercel', '.idea', '.vscode']);
const EXTS = new Set(['.html', '.htm', '.css', '.scss', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte']);
const BANNED_FONTS = ['inter', 'poppins', 'montserrat', 'dm sans', 'manrope', 'space grotesk', 'plus jakarta sans', 'satoshi'];
const PURPLE = ['#7c3aed', '#8b5cf6', '#a855f7', '#9333ea', '#6366f1', '#4f46e5', '#c084fc', '#818cf8', '#a78bfa', '#6d28d9', '#d946ef', '#e879f9', '#f472b6'];
const EMOJI = ['✨', '🚀', '⚡', '🔥', '🎯', '💡', '📈', '✅', '⭐', '🌟', '💎', '🎨', '🧠', '🔒', '💬', '👇', '🙌', '🥇'];

const argv = process.argv.slice(2);
const jsonOut = argv.includes('--json');
const failIdx = argv.indexOf('--fail-under');
const failUnder = failIdx >= 0 ? Number(argv[failIdx + 1]) : 0;
const targets = argv.filter((a, i) => !a.startsWith('--') && !(failIdx >= 0 && i === failIdx + 1));

const root = path.resolve(process.cwd(), targets[0] || '.');

async function walk(dir, acc) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) await walk(p, acc);
    } else if (EXTS.has(path.extname(e.name).toLowerCase())) {
      acc.push(p);
    }
  }
  return acc;
}

function cssOnly(text, ext) {
  if (!['.html', '.htm', '.vue', '.svelte'].includes(ext)) return text;
  const parts = [];
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = styleRe.exec(text))) parts.push(m[1]);
  const inlineRe = /style="([^"]*)"/gi;
  while ((m = inlineRe.exec(text))) parts.push(m[1]);
  return parts.join('\n');
}

const lineOf = (text, snippet) => {
  const i = snippet ? text.indexOf(snippet) : -1;
  return i < 0 ? 1 : text.slice(0, i).split('\n').length;
};

function analyze(text, ext) {
  const css = cssOnly(text, ext);
  const findings = [];
  const add = (o) => findings.push(o);
  const line = (s) => lineOf(text, s);

  /* R7 禁用字体 */
  const fontDecls = [...css.matchAll(/font-family\s*:\s*([^;]+);/gi)].map((m) => m[1]);
  const used = new Set();
  for (const decl of fontDecls) {
    for (const raw of decl.split(',')) {
      const name = raw.trim().replace(/["']/g, '').toLowerCase();
      if (BANNED_FONTS.includes(name)) used.add(name);
    }
  }
  for (const f of used) {
    add({ rule: 'R7', check: 'banned-font', weight: 4, sev: 'warn', line: line('font-family'), evidence: 'font-family: ' + f, fix: '换成系统 UI 字体栈或一款有性格的字（typography.md §3）' });
  }

  /* R5 紫色渐变 / 渐变文字 */
  const grads = [...css.matchAll(/(?:linear|radial|conic)-gradient\(([^)]*)\)/gi)].map((m) => m[1]);
  const purpleHit = grads.find((g) => {
    const hexes = (g.match(/#[0-9a-f]{3,8}/gi) || []).map((h) => h.toLowerCase());
    return hexes.some((h) => PURPLE.includes(h));
  });
  if (purpleHit || /from-purple-|to-pink-|from-violet-|via-fuchsia-/.test(text)) {
    add({ rule: 'R5', check: 'purple-gradient', weight: 10, sev: 'error', line: line(purpleHit ? 'gradient(' + purpleHit : 'from-purple'), evidence: 'purple gradient', fix: '中性底色 + 一个强调色，只给主操作和状态（color.md §2）' });
  }
  if (/background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text|bg-clip-text/.test(css)) {
    add({ rule: 'R8', check: 'gradient-text', weight: 4, sev: 'warn', line: line('background-clip'), evidence: 'gradient text', fix: '纯色标题，靠字重与字号拿气势' });
  }

  /* R4 字号档位 */
  const sizeMatches = [...css.matchAll(/font-size\s*:\s*([0-9.]+)(px|rem|em)/gi)];
  const sizes = new Set(sizeMatches.map((m) => m[1] + m[2].toLowerCase()));
  if (sizes.size > 4) {
    const n = sizes.size;
    add({ rule: 'R4', check: 'too-many-type-sizes', weight: Math.min(10, (n - 4) * 2), sev: 'error', line: line(sizeMatches[0][0]), evidence: n + ' 种字号: ' + [...sizes].join(' / '), fix: '收敛到 4 级，其余用字重和灰度区分（typography.md §1）' });
  }

  /* R4 全大写 + 字距的小眉标 */
  const upperBlocks = css.split('}').filter((b) => /text-transform\s*:\s*uppercase/i.test(b) && /letter-spacing/i.test(b)).length;
  const twUpper = /\buppercase\b/.test(text) && /tracking-/.test(text) ? 1 : 0;
  if (upperBlocks + twUpper > 0) {
    add({ rule: 'R4', check: 'uppercase-eyebrow', weight: Math.min(8, (upperBlocks + twUpper) * 4), sev: 'warn', line: line('text-transform: uppercase'), evidence: (upperBlocks + twUpper) + ' 处全大写 + 字距小标签', fix: '去掉眉标，或改成正常字重的小标签（tells.md §3）' });
  }

  /* R1 圆角档位 */
  const radii = new Set();
  for (const m of css.matchAll(/border-radius\s*:\s*([^;]+);/gi)) {
    for (const tok of m[1].split(/[\s\/]+/)) {
      if (/^[0-9.]+(px|rem|em|%)?$/.test(tok)) radii.add(tok);
    }
  }
  if (radii.size > 4) {
    const n = radii.size;
    const firstRadius = (css.match(/border-radius\s*:\s*[^;]+;/i) || [''])[0];
    add({ rule: 'R1', check: 'too-many-radii', weight: Math.min(8, (n - 4) * 2), sev: 'warn', line: line(firstRadius), evidence: n + ' 档圆角: ' + [...radii].join(' / '), fix: '收敛到 3–4 档（geometry.md §1）' });
  }

  /* R3 1px 描边 */
  const thick = [...css.matchAll(/border(?:-[a-z]+)?\s*:\s*1px\s+solid/gi)].length;
  if (thick > 6) {
    add({ rule: 'R3', check: 'many-1px-borders', weight: Math.min(6, thick - 6), sev: 'warn', line: line('1px solid'), evidence: thick + ' 处 1px 描边', fix: '改 0.5px 或半透明内阴影，见 geometry.md §4' });
  }

  /* R10 emoji 当图标 */
  let emojiCount = 0;
  for (const e of EMOJI) emojiCount += text.split(e).length - 1;
  if (emojiCount > 0) {
    add({ rule: 'R10', check: 'emoji-icons', weight: Math.min(8, emojiCount * 2), sev: 'warn', line: line('✨'), evidence: emojiCount + ' 个 emoji', fix: '统一一套线性图标（components.md）' });
  }

  /* 玻璃拟态 */
  const blur = [...css.matchAll(/backdrop-filter\s*:\s*[^;]*blur/gi)].length + (text.match(/backdrop-blur/g) || []).length;
  if (blur > 2) {
    add({ rule: 'R8', check: 'backdrop-blur', weight: Math.min(5, (blur - 2) * 2), sev: 'warn', line: line('backdrop-filter'), evidence: blur + ' 处 backdrop blur', fix: '只给真实浮层用' });
  }

  /* R9 transition: all */
  const tAll = [...css.matchAll(/transition\s*:\s*all/gi)].length + (text.match(/transition-all/g) || []).length;
  if (tAll > 0) {
    add({ rule: 'R9', check: 'transition-all', weight: Math.min(8, tAll * 4), sev: 'error', line: line('transition: all'), evidence: tAll + ' 处 transition: all', fix: '指定属性 + 120–240ms + 统一缓动（motion.md §3）' });
  }

  /* 纯黑投影 */
  let blackShadow = 0;
  for (const m of css.matchAll(/box-shadow\s*:\s*([^;]+);/gi)) {
    const v = m[1].trim();
    if (v.startsWith('inset')) continue;
    if (/rgba?\(\s*0[\s,]+0[\s,]+0/.test(v)) blackShadow += 1;
  }
  if (blackShadow > 0) {
    add({ rule: 'R8', check: 'black-shadow', weight: Math.min(5, blackShadow * 3), sev: 'warn', line: line('box-shadow'), evidence: blackShadow + ' 处纯黑投影', fix: '用带色相的双层小扩散阴影（geometry.md §5）' });
  }

  /* R5 色板失控 */
  const hexMatches = [...text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)];
  const tokenized = new Set();
  for (const ln of text.split('\n')) {
    if (/^\s*--[a-z0-9-]+\s*:/i.test(ln)) {
      for (const h of ln.match(/#[0-9a-fA-F]{3,8}\b/g) || []) tokenized.add(h.toLowerCase());
    }
  }
  const hexes = new Set(hexMatches.map((m) => m[0].toLowerCase()).filter((h) => !tokenized.has(h)));
  if (hexes.size > 10) {
    add({ rule: 'R5', check: 'palette-drift', weight: Math.min(8, hexes.size - 10), sev: 'warn', line: line(hexMatches[hexMatches.length - 1][0]), evidence: hexes.size + ' 个不同颜色值', fix: '收进 token：中性 8–12 阶 + 1 个强调色（color.md）' });
  }

  /* 加分：做到了就给 */
  const tokenCount = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1])).size;
  if (tokenCount >= 8) findings.push({ rule: 'bonus', check: 'tokens', weight: -4, sev: 'good', line: 1, evidence: tokenCount + ' 个设计变量', fix: '保持：token 先行' });
  if (/:focus-visible/.test(css)) findings.push({ rule: 'bonus', check: 'focus-visible', weight: -3, sev: 'good', line: 1, evidence: '有 focus-visible', fix: '保持：焦点可见' });
  if (/prefers-reduced-motion/.test(css)) findings.push({ rule: 'bonus', check: 'reduced-motion', weight: -3, sev: 'good', line: 1, evidence: '有 prefers-reduced-motion', fix: '保持：尊重动效偏好' });

  const penalty = findings.filter((f) => f.weight > 0).reduce((s, f) => s + f.weight, 0);
  const bonus = findings.filter((f) => f.weight < 0).reduce((s, f) => s + f.weight, 0);
  const score = Math.max(0, Math.min(100, 100 - penalty - bonus));
  return { findings, score, stats: { typeSizes: sizes.size, radii: radii.size, colors: hexes.size, tokens: tokenCount } };
}

const grade = (s) => (s >= 92 ? 'A' : s >= 85 ? 'B' : s >= 70 ? 'C' : 'D');
const pad = (s, n) => { s = String(s); return s + ' '.repeat(Math.max(0, n - s.length)); };

let files = [];
try {
  const st = await statFn(root);
  files = st.isFile() ? [root] : await walk(root, []);
} catch {
  files = [];
}
if (files.length === 0) {
  console.log('没有找到可扫描的文件: ' + root);
  process.exit(0);
}

const results = [];
for (const f of files) {
  const text = await readFile(f, 'utf8');
  const ext = path.extname(f).toLowerCase();
  const r = analyze(text, ext);
  results.push({ file: path.relative(process.cwd(), f).replace(/\\/g, '/'), ...r });
}

const mean = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);

if (jsonOut) {
  console.log(JSON.stringify({ version: VERSION, root, mean, files: results }, null, 2));
} else {
  console.log('');
  console.log('anti-ai-slop-ui · audit v' + VERSION);
  console.log('-'.repeat(64));
  console.log(pad('文件', 34) + pad('分数', 6) + pad('等级', 6) + '问题');
  for (const r of results) {
    const issues = r.findings.filter((f) => f.sev !== 'good').length;
    console.log(pad(r.file, 34) + pad(r.score, 6) + pad(grade(r.score), 6) + issues);
  }
  console.log('-'.repeat(64));
  console.log('均值 ' + mean + ' · ' + (mean >= 92 ? '可发布' : mean >= 85 ? '合格' : mean >= 70 ? '皮肤还在用默认值' : '回第一步：定主体、定 token'));

  const bad = results.flatMap((r) => r.findings.filter((f) => f.sev !== 'good').map((f) => ({ file: r.file, ...f })));
  if (bad.length) {
    console.log('');
    console.log('问题清单（按权重）');
    bad.sort((a, b) => b.weight - a.weight);
    for (const f of bad) {
      console.log('  ' + f.file + ':' + f.line + '  [' + f.rule + '] ' + f.evidence + '  → ' + f.fix);
    }
  }
  const good = results.flatMap((r) => r.findings.filter((f) => f.sev === 'good').map((f) => ({ file: r.file, ...f })));
  if (good.length) {
    console.log('');
    console.log('做对了');
    for (const g of good) console.log('  ' + g.file + '  ' + g.evidence);
  }
  console.log('');
}

if (failUnder && mean < failUnder) {
  console.error('低于阈值 ' + failUnder + '，当前 ' + mean);
  process.exit(1);
}
