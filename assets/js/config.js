/**
 * config.js — 站点级配置，改这里就能改全站信息
 */
export const SITE = {
  title: "SummerN's Blog",
  author: 'SummerN',
  description: '一个喜欢写代码和文字的开发者，记录学习、思考与探索。',
  url: 'https://plaindwater.github.io',
  email: 'PlaindWater@outlook.com',
  github: 'https://github.com/PlaindWater',
  rss: '/feed.xml',
  avatar: '📝',
  since: 2024,
  nav: [
    { hash: '#/', label: '文章' },
    { hash: '#/about', label: '关于' },
  ],
  social: [
    { label: 'GitHub', href: 'https://github.com/PlaindWater', external: true },
    { label: 'Email', href: 'mailto:PlaindWater@outlook.com' },
    { label: 'RSS', href: './feed.xml' },
  ],
};

export const PATHS = {
  posts: './data/posts.json',
  content: './content/',
};
