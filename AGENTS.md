# Sylvaframe 开发指南

- 用中文与项目负责人沟通。
- Sylvaframe 基于 Deskland Preview。仓库提供 12 个可用主题，彩色城市仅提供预览图。
- Windows 宿主按扩展显示器分别绘制壁纸和分配图标。设置预览及分享对应主屏。
- 界面只保留简体中文和英文，不跟随主程序增加其他语言。
- 不提供账号登录、购买恢复或自动检查更新功能，不接入授权服务、官网更新清单或商店更新接口。
- 保持 `themes.json`、主题参数默认值和中英文文案一致。仅供预览的主题没有 `page` 和 `groups`，点击后说明其当前状态。
- 修改主题后检查图标移动、预览、暂停和分享；所有画布按实际像素与小数显示尺寸绘制。
- 壁纸常驻后台，以核显 30fps 为目标。静态绘图进入缓存，小物体使用局部图层，不在全屏着色器中逐个计算大量物体。
- `prototype/thumbs/` 是人工设计的缩略图，未经要求不要重新生成或覆盖。
- 主程序：`powershell -ExecutionPolicy Bypass -File host\build.ps1`；产物 `host/bin/Sylvaframe.exe`。
- 浏览器预览：`node prototype\serve.mjs`，访问 `http://localhost:5178/settings.html`。
- Windows 宿主：`host/DesktopHost.cs`；改主题 HTML/JS 不需要重新编译宿主，托盘“重新载入”即可。
- 产品显示名为 `Sylvaframe`，图标为本 fork 原创。设置、启动项、安装目录及运行实例使用独立标识。
- 不提交 `host/bin/`、`host/lib/`、个人数据、凭证或本机路径。
- Deskland 名称用于注明上游来源。发布 Sylvaframe 使用自己的产品名和图标。
- 许可见 `LICENSE`，名称和图标的说明见 `TRADEMARKS.md`。
