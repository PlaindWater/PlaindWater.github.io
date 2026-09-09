# lyrics-plus — 歌词显示

Spicetify 的 lyrics-plus 插件支持网易云和 MusixMatch 歌词源，在终端执行以下命令即可开启：

```bash
spicetify config custom_apps lyrics-plus
spicetify apply
```

开启后重启 Spotify，就能在播放界面看到同步歌词了。

# fullAppDisplay — 全屏播放模式

Spotify 官方客户端并没有窗口全屏播放的模式。有了 Spicetify，在终端里启用 fullAppDisplay 插件就能实现：

```bash
spicetify config extensions fullAppDisplay.js
spicetify apply
```

启用后，Spotify 播放界面会以全屏模式展示专辑封面和播放信息，视觉效果非常棒。

> Spicetify 还有很多插件和主题可以探索，官方市场 [Spicetify Marketplace](https://github.com/spicetify/spicetify-marketplace) 是发掘更多功能的好地方。
