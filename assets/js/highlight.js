/**
 * highlight.js — 零依赖的轻量语法着色
 *
 * 覆盖常见语言的关键字 / 字符串 / 注释 / 数字 / 函数名 / 标点。
 * 思路：先把整段代码按「规则并集」切分成 token，再逐段转义输出，
 * 因此不会像连续 replace 那样互相污染。
 */

const KEYWORDS = {
  js: `const let var function return if else for while do of in new class extends super import export
       from default async await try catch finally throw typeof instanceof this null undefined true false
       switch case break continue delete void yield static get set interface type enum implements public
       private readonly as`,
  ts: `const let var function return if else for while do of in new class extends super import export
       from default async await try catch finally throw typeof instanceof this null undefined true false
       switch case break continue delete void yield static get set interface type enum implements public
       private readonly as string number boolean any unknown never`,
  python: `def class return if elif else for while in not and or is None True False import from as with
       try except finally raise lambda yield global nonlocal pass break continue async await print`,
  bash: `if then else elif fi for while do done case esac function return exit export source alias
       sudo apt yum install cd ls cp mv rm mkdir chmod chown echo cat grep sed awk curl wget git`,
  json: `true false null`,
  html: '',
  css: '',
};

const RULES = {
  js: [
    ['com', /\/\/[^\n]*|\/\*[\s\S]*?\*\//],
    ['str', /`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/],
    ['num', /\b0[xXbBoO][\da-fA-F_]+n?\b|\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?n?\b/],
    ['kw', new RegExp(`\\b(?:${KEYWORDS.js.trim().split(/\s+/).join('|')})\\b`)],
    ['fn', /\b[A-Za-z_$][\w$]*(?=\s*\()/],
    ['punc', /[{}[\]();,.:?=+\-*/%<>!&|^~]+/],
  ],
  python: [
    ['com', /#[^\n]*/],
    ['str', /[rbfu]{0,2}"""[\s\S]*?"""|[rbfu]{0,2}'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/],
    ['dec', /@[\w.]+/],
    ['num', /\b0[xXbBoO][\da-fA-F_]+\b|\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b/],
    ['kw', new RegExp(`\\b(?:${KEYWORDS.python.trim().split(/\s+/).join('|')})\\b`)],
    ['fn', /\b[A-Za-z_]\w*(?=\s*\()/],
    ['punc', /[{}[\]();,.:?=+\-*/%<>!&|^~]+/],
  ],
  bash: [
    ['com', /#[^\n]*/],
    ['str', /"(?:\\.|[^"\\])*"|'[^']*'/],
    ['var', /\$\{?[\w@#?*!-]+\}?/],
    ['kw', new RegExp(`\\b(?:${KEYWORDS.bash.trim().split(/\s+/).join('|')})\\b`)],
    ['fn', /^[ \t]*[a-zA-Z_][\w.-]*/], // 行首命令名
    ['flag', /(?<=^|\s)--?[A-Za-z][\w-]*/],
    ['num', /\b\d+\b/],
    ['punc', /[|&;()<>=]+/],
  ],
  json: [
    ['key', /"(?:\\.|[^"\\])*"(?=\s*:)/],
    ['str', /"(?:\\.|[^"\\])*"/],
    ['num', /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/],
    ['kw', /\b(?:true|false|null)\b/],
    ['punc', /[{}[\],:]/],
  ],
  html: [
    ['com', /<!--[\s\S]*?-->/],
    ['tag', /<\/?[A-Za-z][\w-]*/],
    ['attr', /\s[A-Za-z_:][\w:.-]*(?==)/],
    ['str', /"(?:[^"]*)"|'(?:[^']*)'/],
    ['punc', /\/?>/],
  ],
  css: [
    ['com', /\/\*[\s\S]*?\*\//],
    ['str', /"(?:[^"\\])*"|'(?:[^'\\])*'/],
    ['kw', /--[\w-]+|@[\w-]+/],
    ['num', /-?\b\d*\.?\d+(?:px|rem|em|%|vh|vw|s|ms|deg|fr)?\b|#[0-9a-fA-F]{3,8}/],
    ['fn', /\b[a-z-]+(?=\()/i],
    ['sel', /[.#][A-Za-z_][\w-]*/],
    ['punc', /[{}();:,]/],
  ],
};

const ALIASES = {
  javascript: 'js',
  jsx: 'js',
  tsx: 'ts',
  typescript: 'ts',
  node: 'js',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  powershell: 'bash',
  ps1: 'bash',
  yml: 'json',
  yaml: 'json',
  py: 'python',
  xml: 'html',
  vue: 'html',
  scss: 'css',
  less: 'css',
};

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
const escapeCode = (value) => String(value).replace(/[&<>]/g, (ch) => ESCAPE_MAP[ch]);

/**
 * 对代码做语法着色
 * @param {string} code 原始代码
 * @param {string} lang 语言标识
 * @returns {string} 带 <span class="tok-*"> 的 HTML
 */
export function highlight(code, lang = 'text') {
  const raw = String(code).replace(/\s+$/, '');
  const key = ALIASES[lang] || lang;
  const rules = RULES[key];

  if (!rules || !raw) return escapeCode(raw);

  // 'm' 让 bash 的「行首命令名」规则对每一行生效
  const combined = new RegExp(rules.map(([, pattern]) => `(${pattern.source})`).join('|'), 'gm');
  let html = '';
  let last = 0;

  for (const match of raw.matchAll(combined)) {
    if (match.index > last) html += escapeCode(raw.slice(last, match.index));
    const groupIndex = match.slice(1).findIndex((value) => value !== undefined);
    const type = rules[groupIndex] ? rules[groupIndex][0] : 'punc';
    html += `<span class="tok-${type}">${escapeCode(match[0])}</span>`;
    last = match.index + match[0].length;
  }
  html += escapeCode(raw.slice(last));

  return html;
}

/** 供模板直接使用的纯文本提取（搜索用） */
export function stripCodeFences(source) {
  return String(source || '').replace(/```[\s\S]*?```/g, ' ');
}
