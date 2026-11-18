# Sylvaframe

<img src="prototype/assets/sylvaframe.png" width="64" height="64" alt="Sylvaframe icon">

Thanks to **BLEZZ0102** and the contributors to Deskland for open-sourcing the Windows wallpaper host and the Beach and Meadow themes. Sylvaframe is an independent fork that adds an original **Forest** theme and support for extended displays. Each screen renders its own wallpaper and adapts to the icons on that screen. [Upstream project](https://github.com/BLEZZ0102/Deskland)

**Adaptive Windows wallpaper that makes your desktop icons part of the scenery.**

Sylvaframe turns the space around your icons into a living landscape. Move, add or remove an icon and the beach, meadow, clouds and shadows quietly reshape around it — in real time, without AI, an account or an API key.

This fork includes **Beach**, **Meadow** and **Forest**, the Windows host, settings and sharing tools.

**English** · [简体中文](#中文说明) · [Upstream website](https://deskland.app) · [Features](#features) · [Build from source](#build-from-source)

![Meadow — included in Deskland Preview](docs/images/meadow.webp)

![Beach — included in Deskland Preview](docs/images/beach.webp)

![Maldives — locked-theme preview](docs/images/maldives.webp)

Meadow and Beach are included in Preview. Maldives is shown as a locked-theme preview.

## Included themes

| Beach | Meadow | Forest |
| --- | --- | --- |
| ![Beach theme](prototype/thumbs/beach.webp) | ![Meadow theme](prototype/thumbs/meadow.webp) | ![Forest theme](prototype/thumbs/forest-creek.webp) |
| Turquoise waves, kayaks, seabirds and coconut palms. | Drifting clouds and shadows, a boy flying a kite and a little black cat. | Swaying treetops and a creek, with woodland clearings that follow your icons. |

The theme browser also shows 10 locked themes as a preview of the full Wallpaper edition. Their names, descriptions and thumbnails are included.

## Features

- **Adaptive scenery:** uses the real positions of desktop icons and transitions smoothly when they move.
- **Extended displays:** renders independently on each display and sends each wallpaper the icons on its own screen.
- **Three complete themes:** settings for Beach, Meadow and Forest are saved between sessions.
- **Made for the desktop:** tray controls, startup on sign-in and automatic pause when a window is maximized or full-screen.
- **Private sharing:** image and animation exports use sample icons and color blocks, never a screenshot of your desktop or real file names.
- **Independent installation:** Sylvaframe uses its own install directory, settings, startup entry and instance identity, so it can coexist with other Deskland builds.
- **English and Simplified Chinese:** no sign-in, purchase restoration, update service or store API is included.

## Requirements

- Windows 10 or Windows 11, 64-bit.
- Microsoft Edge WebView2 Runtime.
- PowerShell and the .NET Framework C# compiler included with Windows; no .NET SDK installation is required.
- An internet connection for the first build, which downloads the WebView2 development library.
- Node.js only if you want to run the browser preview.

Sylvaframe renders on all extended displays and targets 30 fps on integrated graphics. Settings preview and sharing use the primary display.

## Build from source

Open PowerShell in the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File host\build.ps1
.\Start-Forest.cmd
```

Keep `host/` and `prototype/` together. Build output is written to `host/bin/`.

Run `Start-Forest.cmd` again or double-click the tray icon to open Settings. To exit and restore the original Windows wallpaper, use the tray menu or run:

```powershell
.\Stop-Forest.cmd
```

The launch script uses `%LOCALAPPDATA%\Sylvaframe` for this fork's settings and logs. See [Forest quick start](FOREST.md) for the desktop and offline browser instructions.

## Browser preview

```powershell
node prototype\serve.mjs
```

Open **http://localhost:5178/settings.html**. The browser uses sample icons; adaptation to real desktop icons requires the Windows host.

## Windows installer

Build the NSIS installer without installing global development tools:

```powershell
powershell -ExecutionPolicy Bypass -File tools\build-installer.ps1
```

The first build downloads portable NSIS and Microsoft's WebView2 bootstrapper. Artifacts are written to `dist/` with SHA256 checksums and a matching source ZIP.

The installer targets the current user's `Programs\Sylvaframe` directory and does not require administrator rights. If WebView2 is missing, its bootstrapper requires an internet connection. Uninstalling preserves user settings.

The original project's Windows installer is available from its release page. [Upstream Deskland Preview releases](https://github.com/BLEZZ0102/Deskland/releases/latest)

## Project layout

| Path | Contents |
| --- | --- |
| `host/` | Windows host, build scripts and application manifest |
| `prototype/flat.html` | Beach theme |
| `prototype/meadow.html` | Meadow theme |
| `prototype/forest.html` | Forest theme |
| `prototype/settings.html` | Settings interface |
| `prototype/themes.json` | Full free-theme definitions and locked-theme display metadata |
| `prototype/share.js` | Privacy-preserving image and animation sharing |
| `prototype/assets/` | Images used by the included themes |
| `tools/` | Installer build tooling |

## Known limitations

- Settings preview and sharing show the primary display.
- Windows Spotlight or a wallpaper slideshow can briefly flash when Windows changes the background image.
- Preview does not include account sign-in, entitlement restoration, automatic updates or the other themes' implementation.

## Credits and license

Source code and included theme assets are released under [GPL-3.0](LICENSE). Third-party dependencies are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The Deskland name and icon are not licensed as trademarks; modified distributions should use their own name and icon. See [TRADEMARKS.md](TRADEMARKS.md).

For Sylvaframe feedback, open an issue in this fork. [Sylvaframe Issues](https://github.com/XiaoyuZhuang/Deskland/issues)

---

## 中文说明

感谢 **BLEZZ0102** 和所有贡献者开源 Deskland 的 Windows 壁纸宿主、沙滩与草地主题。Sylvaframe 是独立 fork，新增了原创「森林」主题和扩展多屏支持，并使用自己的名称和图标。每块屏幕各自渲染，林间空地跟随该屏幕上的图标。[原仓库](https://github.com/BLEZZ0102/Deskland)

[English](#sylvaframe) · **简体中文** · [森林使用说明](FOREST.md)

**让桌面图标成为风景的一部分。**

Sylvaframe 是一款 Windows 自适应动态壁纸。移动、添加或删除桌面图标时，海岸线、草地、云朵和阴影会实时围绕图标调整。全部在本地实时演算，不使用 AI，无需账号或 API Key。

本 fork 包含沙滩、草地和森林三个主题，以及 Windows 宿主、设置界面与分享工具。

[原项目官网](https://deskland.app) · [从源码运行](#build-from-source) · [许可](#credits-and-license)

### 包含的主题

| 沙滩 | 草地 | 森林 |
| --- | --- | --- |
| ![沙滩主题](prototype/thumbs/beach.webp) | ![草地主题](prototype/thumbs/meadow.webp) | ![森林主题](prototype/thumbs/forest-creek.webp) |
| 海浪、皮划艇、海鸟和椰子树。 | 漂浮的云与云影、放风筝的男孩和小黑猫。 | 树梢随风摆动，小溪穿过树林，林间空地跟随图标。 |

主题列表还展示另外 10 个锁定主题，仅包含名称、简介和缩略图。

### 功能

- **图标自适应：**读取真实桌面图标的位置，在移动、添加或删除时平滑调整场景。
- **扩展多屏：**每块显示器独立渲染，并按屏幕分配桌面图标的位置。
- **三个完整主题：**沙滩、草地和森林的参数均可调整并自动保存。
- **适合常驻桌面：**托盘控制、开机自动启动，前台窗口最大化或全屏时自动暂停。
- **隐私分享：**图片和动画使用示例图标与名字色块，不截取桌面窗口或真实文件名。
- **独立安装：**安装目录、用户数据、启动项和运行实例标识均独立，可与其他 Deskland 版本共存。
- **简体中文和英文：**不包含登录、购买恢复、自动更新或商店接口。

### 系统要求

- Windows 10 / Windows 11，64 位。
- Microsoft Edge WebView2 Runtime。
- 使用 Windows 自带的 .NET Framework C# 编译器，无需安装 .NET SDK。
- 第一次构建需要联网下载 WebView2 开发库。
- 仅浏览器预览需要 Node.js。

壁纸覆盖所有扩展显示器，以核显 30fps 为目标。设置预览和分享对应主显示器。

### 从源码运行

在仓库根目录打开 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File host\build.ps1
.\Start-Forest.cmd
```

请保持 `host/` 和 `prototype/` 的相对目录结构，编译结果位于 `host/bin/`。

再次运行 `Start-Forest.cmd` 或双击托盘图标可打开设置。用托盘菜单退出或运行下面的命令，即可恢复 Windows 壁纸。

```powershell
.\Stop-Forest.cmd
```

通过启动脚本运行时，本 fork 的设置和日志保存在 `%LOCALAPPDATA%\Sylvaframe`。

### 浏览器预览

```powershell
node prototype\serve.mjs
```

打开 **http://localhost:5178/settings.html**。浏览器使用示例图标，真实桌面图标适配需要 Windows 宿主。

### Windows 安装包

```powershell
powershell -ExecutionPolicy Bypass -File tools\build-installer.ps1
```

首次构建会下载便携版 NSIS 和微软 WebView2 引导程序，无需安装全局开发工具。产物位于 `dist/`，附 SHA256 校验文件和对应源码 ZIP。

安装包安装到当前用户的 `Programs\Sylvaframe` 目录，无需管理员权限。缺少 WebView2 时需要联网安装；卸载保留用户设置。

原项目的 Windows 安装包可从其发布页下载。[原仓库的 Deskland Preview 发布页](https://github.com/BLEZZ0102/Deskland/releases/latest)

### 目录结构

| 路径 | 用途 |
| --- | --- |
| `host/` | Windows 宿主、构建脚本与清单 |
| `prototype/flat.html` | 沙滩主题 |
| `prototype/meadow.html` | 草地主题 |
| `prototype/forest.html` | 森林主题 |
| `prototype/settings.html` | 设置界面 |
| `prototype/themes.json` | 免费主题完整定义及锁定主题展示信息 |
| `prototype/share.js` | 隐私保护的图片和动画分享 |
| `prototype/assets/` | 随附主题图片素材 |
| `tools/` | 安装包构建工具 |

### 已知限制

- 设置预览和分享对应主显示器。
- 使用 Windows 聚焦或壁纸幻灯片时，系统换图可能造成短暂闪烁。
- 体验版不包含账号登录、购买恢复、自动更新或其他主题实现。

### 许可与反馈

项目源码和随附主题素材按 [GPL-3.0](LICENSE) 发布，第三方依赖见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

Deskland 名称与图标不作为商标授权授予；修改版应使用自己的名称和图标，详见 [TRADEMARKS.md](TRADEMARKS.md)。

欢迎在本 fork 的 Issues 反馈 Sylvaframe 的问题和建议。[Sylvaframe Issues](https://github.com/XiaoyuZhuang/Deskland/issues)
