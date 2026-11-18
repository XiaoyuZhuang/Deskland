# Sylvaframe 森林主题

森林是一幅俯视的动态溪谷插画。松树和阔叶树随风摆动，溪流上有水纹和反光。开启「自适应」时，移动、添加或删除桌面图标会改变林间空地的位置。

## Windows 动态壁纸

1. 在仓库根目录运行 `powershell -ExecutionPolicy Bypass -File host\build.ps1`。首次构建需要从 NuGet 下载 WebView2 开发库。
2. 若已有另一个 Deskland 壁纸实例在运行，先用它的托盘菜单退出，避免两个程序同时绘制桌面。
3. 双击 `Start-Forest.cmd`。首次运行会在所有扩展显示器上应用森林壁纸，并打开设置。可调节空地留白、树木密度、动画速度和溪流宽度。
4. 双击 `Stop-Forest.cmd` 或使用托盘的「退出」，恢复 Windows 原壁纸。

便携版需要 64 位 Windows 10 或 11 及 Microsoft Edge WebView2 Runtime。选中的主题和参数保存在当前用户的 `%LOCALAPPDATA%\Sylvaframe`。首次启动可导入旧版森林便携程序的设置。界面语言默认跟随系统，可在设置页切换简体中文和英文。

每块屏幕自成一幅森林。开启「自适应」时，空地跟随该屏幕上图标的位置。空屏会显示完整的森林动画。设置中的预览及图片、动画分享对应主屏。

## 浏览器试玩

直接打开 `prototype/forest.html`。可以拖动示例图标，或聚焦一个图标后用方向键移动。右下角按钮可以暂停或继续动画。

如需在浏览器里体验完整设置页，运行 `node prototype/serve.mjs`，访问 [森林主题设置](http://localhost:5178/settings.html?theme=forest)。浏览器预览使用示例图标。

本 fork 基于 Deskland Preview 的 GPL-3.0 源码。森林插画、树冠动画、空地逻辑和多屏支持为本 fork 新增。原项目的版权及许可见 [NOTICE](NOTICE) 和 [LICENSE](LICENSE)。
