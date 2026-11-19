# Sylvaframe 森林主题

森林是一幅俯视的动态溪谷插画。松树和阔叶树随风摆动，溪流上有水纹和反光。开启「自适应」时，移动、添加或删除桌面图标会改变林间空地的位置。

## Windows 动态壁纸

1. 按 [README](README.md) 下载或构建 Sylvaframe。
2. 打开设置并选择「森林」。可调节空地留白、树木密度、动画速度和溪流宽度。
3. 开启「自适应」，把图标拖到溪流上。溪流会绕过图标，移走图标后恢复原来的路线。

便携版需要 64 位 Windows 10 或 11 及 Microsoft Edge WebView2 Runtime。选中的主题和参数保存在当前用户的 `%LOCALAPPDATA%\Sylvaframe`。首次启动可导入旧版森林便携程序的设置。界面语言默认跟随系统，可在设置页切换简体中文和英文。

每块屏幕自成一幅森林。开启「自适应」时，空地跟随该屏幕上图标的位置。空屏会显示完整的森林动画。设置中的预览及图片、动画分享对应主屏。

## 浏览器试玩

直接打开 `prototype/forest.html`。可以拖动示例图标，或聚焦一个图标后用方向键移动。右下角按钮可以暂停或继续动画。

如需在浏览器里体验完整设置页，运行 `node prototype/serve.mjs`，访问 [森林主题设置](http://localhost:5178/settings.html?theme=forest)。浏览器预览使用示例图标。

森林插画、树冠动画、空地逻辑和多屏支持由 Sylvaframe 新增。版权、修改声明和许可见 [NOTICE](NOTICE) 和 [LICENSE](LICENSE)。
