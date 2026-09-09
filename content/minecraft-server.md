# 一、搭建纯净服

**1. 下载服务端核心**

通过 [MCVersions.net](https://mcversions.net/) 可以下载 MC 各版本的服务端核心 jar 文件。

**2. 创建启动脚本**

将下载的 jar 文件放在一个空白文件夹中，新建文本文档，键入以下内容：

```bash
java -Xmx1024M -Xms1024M -jar minecraft_server.1.20.2.jar nogui
```

保存后将文件后缀从 `.txt` 改为 `.bat`。

**3. 首次启动**

双击 bat 文件启动后会自动生成配置文件。在生成的 `eula.txt` 中将最后的 `false` 改为 `true`，表明接受许可协议，然后重新启动即可。

# 二、搭建 Mod 服

使用 Fabric 或 Forge 开服。高版本的 Fabric/Forge 开服较为方便，只需前往其官网下载核心安装器，安装服务端后会自动下载相应的官方服务端核心并生成启动脚本。

# 三、内网穿透

使用 Sakura Frp 等内网穿透工具，让外网的小伙伴能够连接到你的服务器。

# 四、部署到云服务器

一般云服务器使用 Linux 系统，下面以 CentOS 为例：

**Screen — SSH 断开后保持服务器运行**

```bash
yum install screen           # 安装 screen
screen -ls                   # 查看已有会话
screen -R [name]             # 新建会话
screen -R [name] -X quit     # 删除会话
```

快捷键：`Ctrl+A` 再按 `d` 保存当前会话并回到主会话。

**文件权限设置**

```bash
chmod 755 filename
```

该命令将文件所有者设为读、写、执行（7），所属组和其他用户设为读、执行（5）。部署到云服务器后需要修改脚本权限，否则可能无法执行。

> 搭建 MC 服务器最核心的三步：获取服务端 → 配置启动 → 网络可达。剩下的就是享受和好友一起玩的乐趣。
