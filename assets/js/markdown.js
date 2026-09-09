/**
 * markdown.js — 零依赖的极简 Markdown 渲染器
 *
 * 支持：ATX 标题、段落、粗体/斜体/删除线、行内代码、链接、图片、
 *       围栏代码块（```lang）、引用、有序/无序列表（含一层嵌套）、分割线
 * 标题层级会整体下移一级（# → h2），避免与文章主标题抢 h1。
 */

import { highlight } from './highlight.js';

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

const CODE_PLACEHOLDER = '\u0000';

/** 生成标题锚点 id，中文按 unicode 保留，空格转短横线 */
export function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[`*_~[\]()#!]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** 行内语法：代码 → 转义 → 图片/链接 → 强调 */
export function renderInline(text) {
  const codeSpans = [];
  let out = String(text).replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(code);
    return `${CODE_PLACEHOLDER}${codeSpans.length - 1}${CODE_PLACEHOLDER}`;
  });

  out = escapeHTML(out);

  out = out.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_, alt, src, title) =>
      `<img src="${src}" alt="${alt}"${title ? ` title="${title}"` : ''} loading="lazy" decoding="async">`
  );

  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, label, href) => {
    const external = /^https?:/i.test(href);
    const rel = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}"${rel}>${label}</a>`;
  });

  out = out
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');

  return out.replace(
    new RegExp(`${CODE_PLACEHOLDER}(\\d+)${CODE_PLACEHOLDER}`, 'g'),
    (_, index) => `<code>${escapeHTML(codeSpans[Number(index)])}</code>`
  );
}

const BLOCK_START = /^(?:#{1,6}\s|>|```|([-*+]|\d+[.)])\s|(-{3,}|\*{3,}|_{3,})\s*$)/;

function isListItem(line) {
  return /^\s*([-*+]|\d+[.)])\s+/.test(line);
}

function listItemText(line) {
  return line.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, '');
}

/** 渲染列表，支持一层缩进嵌套 */
function renderList(items) {
  let html = '';
  let i = 0;
  while (i < items.length) {
    const current = items[i];
    const ordered = current.ordered;
    const listTag = ordered ? 'ol' : 'ul';
    const chunk = [];
    while (i < items.length && items[i].ordered === ordered) {
      chunk.push(items[i]);
      i += 1;
    }

    const rows = chunk
      .map((item) => {
        const nested = item.children.length
          ? `<${item.children[0].ordered ? 'ol' : 'ul'}>${item.children
              .map((child) => `<li>${renderInline(child.text)}</li>`)
              .join('')}</${item.children[0].ordered ? 'ol' : 'ul'}>`
          : '';
        return `<li>${renderInline(item.text)}${nested}</li>`;
      })
      .join('');

    html += `<${listTag}>${rows}</${listTag}>`;
  }
  return html;
}

function collectList(lines, start) {
  const items = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      // 空行后若仍是缩进的列表项则继续，否则结束
      const next = lines[i + 1];
      if (next && /^\s{2,}([-*+]|\d+[.)])\s+/.test(next)) {
        i += 1;
        continue;
      }
      break;
    }
    if (!isListItem(line)) break;

    const indent = line.match(/^\s*/)[0].length;
    const ordered = /^\s*\d+[.)]\s+/.test(line);
    const item = { text: listItemText(line), ordered, indent, children: [] };

    if (indent >= 2 && items.length) {
      items[items.length - 1].children.push(item);
    } else {
      items.push(item);
    }
    i += 1;
  }
  return { items, next: i };
}

/**
 * 渲染 Markdown 为 HTML 字符串
 * @param {string} source Markdown 原文
 * @returns {string} HTML
 */
export function renderMarkdown(source) {
  if (!source) return '';
  const lines = String(source).replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 空行
    if (!line.trim()) {
      i += 1;
      continue;
    }

    // 围栏代码块
    const fence = line.match(/^```(\S*)\s*$/);
    if (fence) {
      const lang = (fence[1] || 'text').toLowerCase();
      const buffer = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1; // 跳过收尾围栏
      const code = buffer.join('\n');
      const label = lang === 'text' ? 'TEXT' : lang.toUpperCase();
      html.push(
        `<figure class="code-block" data-lang="${escapeHTML(lang)}">` +
          '<figcaption class="code-head">' +
          `<span class="code-lang">${escapeHTML(label)}</span>` +
          '<button type="button" class="code-copy" data-copy>复制</button>' +
          '</figcaption>' +
          `<pre><code class="language-${escapeHTML(lang)}">${highlight(code, lang)}</code></pre>` +
          '</figure>'
      );
      continue;
    }

    // 标题
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = Math.min(heading[1].length + 1, 6);
      const text = heading[2].trim();
      const id = slugify(text);
      html.push(`<h${level} id="${escapeHTML(id)}">${renderInline(text)}</h${level}>`);
      i += 1;
      continue;
    }

    // 分割线
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      html.push('<hr>');
      i += 1;
      continue;
    }

    // 引用
    if (/^>\s?/.test(line)) {
      const buffer = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buffer.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      html.push(`<blockquote>${renderMarkdown(buffer.join('\n'))}</blockquote>`);
      continue;
    }

    // 列表
    if (isListItem(line)) {
      const { items, next } = collectList(lines, i);
      html.push(renderList(items));
      i = next;
      continue;
    }

    // 段落
    const buffer = [];
    while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) {
      buffer.push(lines[i].trim());
      i += 1;
    }
    if (buffer.length) {
      html.push(`<p>${renderInline(buffer.join('\n')).replace(/\n/g, '<br>')}</p>`);
    }
  }

  return html.join('\n');
}

/** 从 Markdown 中抽取 h2/h3 生成目录 */
export function extractToc(source) {
  const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n');
  const toc = [];
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const text = heading[2].trim().replace(/[`*]/g, '');
      toc.push({ level: Number(heading[1].length), text, id: slugify(text) });
    }
  }
  return toc;
}

/** 估算阅读时长（分钟）：中文按字数、英文按词数 */
export function readingTime(source) {
  const text = String(source || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*`_\-\[\]()!]/g, ' ');
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 220));
}
