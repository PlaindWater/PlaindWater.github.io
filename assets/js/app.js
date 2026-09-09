/**
 * app.js — 应用入口：路由、视图渲染与交互
 */

import { SITE, PATHS } from './config.js';
import { renderMarkdown, extractToc, readingTime, escapeHTML } from './markdown.js';
import { initTheme, cycleTheme } from './theme.js';

/* ============================================================
 * 图标
 * ========================================================== */
const ICONS = {
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/></svg>',
  auto: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6.5A3.5 3.5 0 0 0 3 6.5v6A2.5 2.5 0 0 0 5.5 15"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V6M6 12l6-6 6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
};

const icon = (name) => ICONS[name] || '';

/* ============================================================
 * 状态
 * ========================================================== */
const state = {
  posts: [],
  query: '',
  tag: '',
  status: 'loading', // loading | ready | error
};

const app = document.getElementById('app');
const progressBar = document.getElementById('progress');
const backTop = document.getElementById('backTop');

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
 * 数据层
 * ========================================================== */
async function loadPosts() {
  try {
    const meta = await fetch(PATHS.posts, { cache: 'no-cache' }).then((res) => {
      if (!res.ok) throw new Error(`posts.json ${res.status}`);
      return res.json();
    });

    const posts = meta.posts.map((post) => ({ ...post, tags: post.tags || [] }));

    await Promise.all(
      posts.map(async (post) => {
        const res = await fetch(PATHS.content + post.file, { cache: 'no-cache' });
        post.markdown = res.ok ? await res.text() : '';
        post.html = renderMarkdown(post.markdown);
        post.toc = extractToc(post.markdown);
        post.minutes = readingTime(post.markdown);
        post.plain = post.markdown.replace(/[#>*`_\-[\]()!]/g, ' ');
      })
    );

    posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    state.posts = posts;
    state.status = 'ready';
  } catch (error) {
    console.error(error);
    state.status = 'error';
  }
}

const allTags = () => [...new Set(state.posts.flatMap((post) => post.tags))];

function filterPosts() {
  const query = state.query.trim().toLowerCase();
  return state.posts.filter((post) => {
    if (state.tag && !post.tags.includes(state.tag)) return false;
    if (!query) return true;
    return (post.title + post.excerpt + post.tags.join('') + post.plain).toLowerCase().includes(query);
  });
}

const findPost = (id) => state.posts.find((post) => String(post.id) === String(id));

/* ============================================================
 * 片段
 * ========================================================== */
const formatDate = (value) => {
  const [y, m, d] = String(value).split('-');
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
};

function tagPills(tags) {
  return tags.map((tag) => `<span class="pill">${escapeHTML(tag)}</span>`).join('');
}

function postCard(post, index) {
  return `
    <a class="card reveal" href="#/post/${post.id}" style="--i:${index}" data-post="${post.id}">
      <div class="card-meta">
        <time datetime="${post.date}">${formatDate(post.date)}</time>
        <span class="dot"></span>
        <span>${post.minutes} 分钟</span>
      </div>
      <h3 class="card-title">${escapeHTML(post.title)}</h3>
      <p class="card-excerpt">${escapeHTML(post.excerpt)}</p>
      <div class="card-foot">${tagPills(post.tags)}<span class="card-more">阅读全文 →</span></div>
    </a>`;
}

function emptyState(text) {
  return `
    <div class="empty">
      <div class="empty-icon">${icon('search')}</div>
      <p>${escapeHTML(text)}</p>
    </div>`;
}

/* ============================================================
 * 视图：首页
 * ========================================================== */
function viewHome() {
  const tags = allTags();
  app.innerHTML = `
    <section class="hero">
      <div class="avatar">${SITE.avatar}</div>
      <h1 class="hero-title">你好，我是 ${escapeHTML(SITE.author)}</h1>
      <p class="hero-sub">${escapeHTML(SITE.description)}</p>
      <div class="social">
        ${SITE.social
          .map(
            (item) =>
              `<a href="${item.href}"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHTML(item.label)}</a>`
          )
          .join('<span class="sep">·</span>')}
      </div>
    </section>

    <div class="toolbar">
      <label class="search">
        ${icon('search')}
        <input id="searchInput" type="search" placeholder="搜索文章（按 / 聚焦）" autocomplete="off"
               value="${escapeHTML(state.query)}" aria-label="搜索文章">
      </label>
      <div class="chips" role="group" aria-label="按标签筛选">
        <button class="chip${state.tag ? '' : ' is-active'}" data-tag="">全部</button>
        ${tags
          .map(
            (tag) =>
              `<button class="chip${state.tag === tag ? ' is-active' : ''}" data-tag="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`
          )
          .join('')}
      </div>
    </div>

    <p class="result-count" id="resultCount" role="status" aria-live="polite"></p>
    <div class="list" id="postList"></div>
  `;

  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => {
    state.query = input.value;
    refreshList();
  });

  app.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.tag = chip.dataset.tag;
      app.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c === chip));
      refreshList();
    });
  });

  refreshList();
}

function refreshList() {
  const list = document.getElementById('postList');
  const count = document.getElementById('resultCount');
  if (!list) return;

  const posts = filterPosts();
  count.textContent = posts.length ? `共 ${posts.length} 篇文章` : '';
  list.innerHTML = posts.length
    ? posts.map((post, index) => postCard(post, index)).join('')
    : emptyState(state.tag ? `没有标签为「${state.tag}」的文章` : `没有匹配「${state.query}」的文章`);
}

/* ============================================================
 * 视图：文章详情
 * ========================================================== */
function viewPost(id) {
  const post = findPost(id);
  if (!post) return viewNotFound();

  const index = state.posts.indexOf(post);
  const prev = state.posts[index - 1];
  const next = state.posts[index + 1];

  app.innerHTML = `
    <article class="post" data-post="${post.id}">
      <a class="back" href="#/">${icon('back')} 返回文章列表</a>
      <header class="post-head">
        <h1 class="post-title">${escapeHTML(post.title)}</h1>
        <div class="post-meta">
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <span class="dot"></span>
          <span>约 ${post.minutes} 分钟</span>
          <span class="dot"></span>
          ${tagPills(post.tags)}
        </div>
      </header>

      ${
        post.toc.length > 1
          ? `<aside class="toc" aria-label="目录">
              <p class="toc-title">目录</p>
              <ol>${post.toc
                .map(
                  (item) =>
                    `<li class="toc-lv${item.level}"><a href="#/post/${post.id}" data-anchor="${item.id}">${escapeHTML(item.text)}</a></li>`
                )
                .join('')}</ol>
             </aside>`
          : ''
      }

      <div class="prose" id="prose">${post.html}</div>

      <nav class="post-nav">
        ${prev ? `<a class="post-nav-item" href="#/post/${prev.id}"><span>上一篇</span><strong>${escapeHTML(prev.title)}</strong></a>` : '<span></span>'}
        ${next ? `<a class="post-nav-item is-next" href="#/post/${next.id}"><span>下一篇</span><strong>${escapeHTML(next.title)}</strong></a>` : '<span></span>'}
      </nav>
    </article>
  `;

  bindPostEvents();
  document.title = `${post.title} · ${SITE.title}`;
}

function bindPostEvents() {
  // 目录跳转
  app.querySelectorAll('.toc a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.getElementById(link.dataset.anchor);
      if (target) target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    });
  });

  // 复制代码
  app.querySelectorAll('[data-copy]').forEach((button) => {
    button.innerHTML = `${icon('copy')}<span>复制</span>`;
    button.addEventListener('click', async () => {
      const code = button.closest('.code-block')?.querySelector('code');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.innerText);
        button.classList.add('is-done');
        button.innerHTML = `${icon('check')}<span>已复制</span>`;
        setTimeout(() => {
          button.classList.remove('is-done');
          button.innerHTML = `${icon('copy')}<span>复制</span>`;
        }, 1800);
      } catch {
        button.innerHTML = `${icon('copy')}<span>复制失败</span>`;
      }
    });
  });

  // 目录高亮
  const headings = [...app.querySelectorAll('.prose h2, .prose h3, .prose h4')];
  const links = [...app.querySelectorAll('.toc a')];
  if (!headings.length || !links.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle('is-active', link.dataset.anchor === entry.target.id));
      });
    },
    { rootMargin: '-80px 0px -70% 0px' }
  );
  headings.forEach((heading) => observer.observe(heading));
}

/* ============================================================
 * 视图：关于 / 404 / 加载失败
 * ========================================================== */
function viewAbout() {
  app.innerHTML = `
    <section class="hero">
      <div class="avatar">${SITE.avatar}</div>
      <h1 class="hero-title">关于我</h1>
      <p class="hero-sub">${escapeHTML(SITE.description)}</p>
      <div class="social">
        ${SITE.social
          .map(
            (item) =>
              `<a href="${item.href}"${item.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHTML(item.label)}</a>`
          )
          .join('<span class="sep">·</span>')}
      </div>
    </section>

    <div class="prose about">
      <h2>关于这个博客</h2>
      <p>这个博客用原生 HTML、CSS 和 JavaScript 写成，没有框架、没有构建步骤、没有第三方依赖。文章以 Markdown 文件存放，Markdown 渲染与代码高亮都是站点自带的实现。</p>
      <p>发布新文章只需要两步：在 <code>content/</code> 下新建一个 <code>.md</code> 文件，再把元信息追加到 <code>data/posts.json</code>。</p>

      <h2>技术细节</h2>
      <ul>
        <li>原生 ES Modules，按功能拆分成数据层、渲染层与主题模块</li>
        <li>CSS 设计令牌基于 <code>oklch()</code>，深浅色主题自动跟随系统</li>
        <li>哈希路由，无需服务端重写规则即可部署在任意静态托管上</li>
        <li>无障碍：跳过导航、语义化标签、键盘可达、尊重 <code>prefers-reduced-motion</code></li>
      </ul>

      <h2>文章标签</h2>
      <p>${allTags().map((tag) => `<span class="pill">${escapeHTML(tag)}</span>`).join(' ')}</p>
    </div>
  `;
  document.title = `关于 · ${SITE.title}`;
}

function viewNotFound() {
  app.innerHTML = `
    <div class="empty">
      <div class="empty-icon">🚧</div>
      <h2>页面走丢了</h2>
      <p>你访问的地址不存在，<a href="#/">回到首页</a>看看？</p>
    </div>`;
  document.title = `404 · ${SITE.title}`;
}

function viewError() {
  app.innerHTML = `
    <div class="empty">
      <div class="empty-icon">📡</div>
      <h2>文章加载失败</h2>
      <p>可能是网络问题，<button class="linklike" id="retry">点此重试</button>。</p>
    </div>`;
  document.getElementById('retry').addEventListener('click', boot);
}

/* ============================================================
 * 路由
 * ========================================================== */
function parseHash() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash || hash === '/' || hash === 'home') return { name: 'home' };
  if (hash === 'about') return { name: 'about' };
  const post = hash.match(/^\/?(?:article|post)\/([\w-]+)$/);
  if (post) return { name: 'post', id: post[1] };
  return { name: 'notfound' };
}

/** 兼容旧版地址 #article/2 → #/post/2 */
function normalizeHash() {
  const hash = window.location.hash;
  if (/^#article\/\d+$/.test(hash)) {
    window.location.replace(`#/post/${hash.split('/')[1]}`);
    return true;
  }
  if (hash === '#home') {
    window.location.replace('#/');
    return true;
  }
  return false;
}

function render() {
  if (state.status === 'loading') {
    app.innerHTML = '<div class="empty"><div class="empty-icon">⏳</div><p>正在加载…</p></div>';
    return;
  }
  if (state.status === 'error') return viewError();

  const route = parseHash();
  if (route.name === 'post') viewPost(route.id);
  else if (route.name === 'about') viewAbout();
  else if (route.name === 'notfound') viewNotFound();
  else {
    document.title = `${SITE.title} · ${SITE.author}`;
    viewHome();
  }

  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.nav === (route.name === 'post' ? 'home' : route.name));
  });

  app.classList.toggle('is-wide', route.name === 'post');
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function navigate() {
  if (document.startViewTransition && !prefersReducedMotion()) {
    document.startViewTransition(() => render());
  } else {
    render();
  }
}

/* ============================================================
 * 全局交互
 * ========================================================== */
function bindGlobal() {
  // 主题
  const themeButton = document.getElementById('themeToggle');
  initTheme((mode) => {
    themeButton.innerHTML = icon(mode);
    themeButton.title = { auto: '主题：跟随系统', light: '主题：浅色', dark: '主题：深色' }[mode];
    themeButton.setAttribute('aria-label', themeButton.title);
  });
  themeButton.addEventListener('click', cycleTheme);

  // 阅读进度 + 回到顶部
  backTop.innerHTML = icon('up');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    progressBar.style.setProperty('--progress', ratio.toFixed(4));
    backTop.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  onScroll();

  // 快捷键：/ 或 Ctrl/Cmd+K 聚焦搜索，Esc 清空
  document.addEventListener('keydown', (event) => {
    const input = document.getElementById('searchInput');
    const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if (event.key === '/' && !typing) {
      event.preventDefault();
      input?.focus();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      input?.focus();
      input?.select();
    } else if (event.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      state.query = '';
      refreshList();
      input.blur();
    }
  });

  window.addEventListener('hashchange', () => {
    if (!normalizeHash()) navigate();
  });
}

function renderChrome() {
  document.getElementById('brand').textContent = `${SITE.author}'s`;
  document.getElementById('nav').innerHTML = SITE.nav
    .map((item) => `<a href="${item.hash}" data-nav="${item.hash.replace('#/', '') || 'home'}">${item.label}</a>`)
    .join('');
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('footerAuthor').textContent = SITE.author;
  document.getElementById('rssLink').href = SITE.rss;
  document.querySelector('meta[name="description"]')?.setAttribute('content', SITE.description);
}

/* ============================================================
 * 启动
 * ========================================================== */
async function boot() {
  renderChrome();
  bindGlobal();
  if (state.status !== 'ready') {
    state.status = 'loading';
    await loadPosts();
  }
  normalizeHash();
  render();
}

boot();
