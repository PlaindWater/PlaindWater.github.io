# SummerN's Blog

一个零依赖的个人博客：原生 HTML + CSS + JavaScript（ES Modules），没有框架、没有构建步骤、没有第三方库。
Markdown 渲染与代码高亮都是站点自带的实现。

## 目录结构

```
.
├── index.html              # 唯一的 HTML 页面（SPA 外壳）
├── assets/
│   ├── css/main.css        # 全部样式，设计令牌集中在 :root
│   └── js/
│       ├── app.js          # 入口：路由、视图、交互
│       ├── config.js       # 站点信息（改这里）
│       ├── markdown.js     # 极简 Markdown 渲染器
│       ├── highlight.js    # 轻量语法着色
│       └── theme.js        # 三态主题（跟随系统 / 浅色 / 深色）
├── data/posts.json         # 文章元信息（列表页只需要它）
├── content/*.md            # 文章正文
├── feed.xml                # RSS
└── sitemap.xml             # 站点地图
```

## 写一篇新文章

1. 在 `content/` 下新建 `my-post.md`，用 Markdown 写正文：

   ````md
   ## 小标题

   正文段落，支持 **粗体**、`行内代码`、[链接](https://example.com)。

   ```bash
   echo "代码块右上角有复制按钮"
   ```
   ````

2. 在 `data/posts.json` 的 `posts` 数组里加一条（保持 `date` 倒序或任意顺序，页面会自动按日期排序）：

   ```json
   {
     "id": 5,
     "slug": "my-post",
     "title": "文章标题",
     "date": "2026-09-09",
     "tags": ["技术"],
     "excerpt": "列表页展示的一句话摘要。",
     "file": "my-post.md"
   }
   ```

3. 推送到 `main`，GitHub Pages 会自动更新。顺手更新一下 `feed.xml` 和 `sitemap.xml`。

## 本地预览

因为使用了 ES Modules 和 `fetch`，需要通过 HTTP 打开（直接双击 `index.html` 会被浏览器的 CORS 策略拦住）：

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000
```

## 路由

哈希路由，无需服务端重写规则，可直接托管在 GitHub Pages / 任意静态空间：

- `#/` 首页（文章列表）
- `#/post/:id` 文章详情
- `#/about` 关于页

旧版地址 `#article/2`、`#home` 会自动跳转到新地址，历史链接不会失效。

## 快捷键

| 按键 | 作用 |
| --- | --- |
| `/` 或 `Ctrl/⌘ + K` | 聚焦搜索框 |
| `Esc` | 清空搜索 |

## 支持的 Markdown 语法

标题、段落、粗体、斜体、删除线、行内代码、链接、图片、围栏代码块（```lang）、引用、
有序/无序列表（含一层嵌套）、分割线。标题层级整体下移一级，即 `#` 渲染为 `<h2>`。

代码高亮覆盖：`js` `ts` `jsx` `tsx` `python` `bash` `sh` `powershell` `json` `yaml`
`html` `xml` `vue` `css` `scss` `less`，未识别的语言按纯文本输出。
