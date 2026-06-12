// ===== Article Data =====
const ARTICLES = [
    {
        id: 2,
        title: "Spicetify 使用笔记",
        date: "2024-02-02",
        tag: "技术",
        excerpt: "Spicetify 是一款 Spotify 客户端美化与增强工具，本文记录了歌词显示和全屏播放模式的开启方法。",
        content: `
            <h3>lyrics-plus — 歌词显示</h3>
            <p>Spicetify 的 lyrics-plus 插件支持网易云和 MusixMatch 歌词源，在终端执行以下命令即可开启：</p>
            <pre><code>spicetify config custom_apps lyrics-plus
spicetify apply</code></pre>
            <p>开启后重启 Spotify，就能在播放界面看到同步歌词了。</p>

            <h3>fullAppDisplay — 全屏播放模式</h3>
            <p>Spotify 官方客户端并没有窗口全屏播放的模式。有了 Spicetify，在终端里启用 fullAppDisplay 插件就能实现：</p>
            <pre><code>spicetify config extensions fullAppDisplay.js
spicetify apply</code></pre>
            <p>启用后，Spotify 播放界面会以全屏模式展示专辑封面和播放信息，视觉效果非常棒。</p>

            <blockquote>Spicetify 还有很多插件和主题可以探索，官方市场 <a href="https://github.com/spicetify/spicetify-marketplace" target="_blank">Spicetify Marketplace</a> 是发掘更多功能的好地方。</blockquote>`,
    },
    {
        id: 3,
        title: "MC 开服笔记",
        date: "2024-01-19",
        tag: "游戏",
        excerpt: "从零开始搭建 Minecraft 服务器的完整记录：纯净服、Mod 服搭建，内网穿透以及云服务器部署。",
        content: `
            <h3>一、搭建纯净服</h3>
            <p><strong>1. 下载服务端核心</strong></p>
            <p>通过 <a href="https://mcversions.net/" target="_blank">MCVersions.net</a> 可以下载 MC 各版本的服务端核心 jar 文件。</p>

            <p><strong>2. 创建启动脚本</strong></p>
            <p>将下载的 jar 文件放在一个空白文件夹中，新建文本文档，键入以下内容：</p>
            <pre><code>java -Xmx1024M -Xms1024M -jar minecraft_server.1.20.2.jar nogui</code></pre>
            <p>保存后将文件后缀从 <code>.txt</code> 改为 <code>.bat</code>。</p>

            <p><strong>3. 首次启动</strong></p>
            <p>双击 bat 文件启动后会自动生成配置文件。在生成的 <code>eula.txt</code> 中将最后的 <code>false</code> 改为 <code>true</code>，表明接受许可协议，然后重新启动即可。</p>

            <h3>二、搭建 Mod 服</h3>
            <p>使用 Fabric 或 Forge 开服。高版本的 Fabric/Forge 开服较为方便，只需前往其官网下载核心安装器，安装服务端后会自动下载相应的官方服务端核心并生成启动脚本。</p>

            <h3>三、内网穿透</h3>
            <p>使用 Sakura Frp 等内网穿透工具，让外网的小伙伴能够连接到你的服务器。</p>

            <h3>四、部署到云服务器</h3>
            <p>一般云服务器使用 Linux 系统，下面以 CentOS 为例：</p>
            <p><strong>Screen — SSH 断开后保持服务器运行</strong></p>
            <pre><code>yum install screen           # 安装 screen
screen -ls                   # 查看已有会话
screen -R [name]             # 新建会话
screen -R [name] -X quit     # 删除会话</code></pre>
            <p>快捷键：<code>Ctrl+A</code> 再按 <code>d</code> 保存当前会话并回到主会话。</p>
            <p><strong>文件权限设置</strong></p>
            <pre><code>chmod 755 filename</code></pre>
            <p>该命令将文件所有者设为读、写、执行（7），所属组和其他用户设为读、执行（5）。部署到云服务器后需要修改脚本权限，否则可能无法执行。</p>

            <blockquote>搭建 MC 服务器最核心的三步：获取服务端 → 配置启动 → 网络可达。剩下的就是享受和好友一起玩的乐趣。</blockquote>`,
    },
    {
        id: 4,
        title: "Windows 激活相关",
        date: "2024-01-19",
        tag: "技术",
        excerpt: "使用 Ohook 方式的 MAS 工具激活 Windows，一行命令即可完成。",
        content: `
            <h3>Ohook 激活方式</h3>
            <p>MAS（Microsoft Activation Scripts）提供了便捷的 Windows 激活方案。使用 Ohook 方式可以在不影响系统文件的前提下完成激活。</p>

            <h3>操作步骤</h3>
            <ol>
                <li>按 <code>Win+R</code> 打开运行，输入 <code>powershell</code>，按 <code>Ctrl+Shift+Enter</code> 以管理员身份运行</li>
                <li>在 PowerShell 窗口中输入以下命令：</li>
            </ol>
            <pre><code>irm https://get.activated.win | iex</code></pre>
            <p>执行后会出现激活选项菜单，选择 Ohook 激活方式即可。</p>

            <blockquote>注意：使用激活工具前请确认当地法律法规。MAS 项目在 GitHub 上开源，可自行审查其源码。</blockquote>`,
    },
];
