# 0.1.0-rc.8.9

## 0.1.0-rc.8.17 (2026-10-12)

- 修复共享配置表单因传输 schema 缺少转换回调而持续加载；使用插件字段解析，保留宿主校验和写入队列。
- 提供商显示改用主题开关；分区布局、窄屏适配、加载原因和保存反馈。保存拒绝保留草稿及原值。
- Decode plugin fields from the shared configuration mirror when wire schemas cannot execute Host transforms; preserve Host validation and queued writes.
- Use themed switches, separate routing and visibility panels, responsive layout and explicit load/save feedback. Rejected writes preserve draft and stored values.

## 0.1.0-rc.8.16 (2026-10-07)

- 缩小图标绘制内容约三分之一，增加方框内的留白。
- Reduce icon artwork by one third with a centered, padded viewBox.

## 0.1.0-rc.8.15 — 2026-10-07

- Open this plugin from the Plugins list to access its existing configuration and controls. Settings no longer duplicates its navigation entry.
- 在插件列表中点击本插件进入详情页，即可使用原有配置和操作界面；设置菜单不再重复显示该插件入口。

## 0.1.0-rc.8.14 (2026-10-07)

- 为插件列表提供中英文名称与说明，并发布独立的 SVG 图标。
- Publish English and Chinese plugin display metadata and a dedicated SVG icon.

## 0.1.0-rc.8.13

- Align maintenance lockfiles and peer versions with the DSH 0.2 runtime.

## 0.1.0-rc.8.12

- Update DSH compatibility requirements and interfaces for 0.2.1-alpha.1.

通过完整模型目录加载 provider 列表，支持无会话时配置可见性；适配当前浏览器 store。

回收原迁移安装中的有效改动；源码与 Git 安装入口统一。测试通过；有构建脚本的插件已重建产物。
