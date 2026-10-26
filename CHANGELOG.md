# 0.1.0-rc.8.9

## 0.1.0-rc.8.22 (2026-10-26)

- 修复热加载插件跨 JavaScript 环境传递模型记录时，被设置服务拒绝为非普通对象的问题；包含真实设置写入回归。
- Normalize model record prototypes when crossing hot-loaded plugin realms so the settings service can persist them; cover the real settings mutation parser.

## 0.1.0-rc.8.21 (2026-10-26)

- 保存不含凭据及异常正文的最近一次 API 模型同步结果和失败阶段，便于运行验收与故障定位。
- Persist fixed API catalog outcome and failure-phase labels for operational diagnosis, without credentials or exception text.

## 0.1.0-rc.8.20 (2026-10-26)

- 自定义 API 模型可按指定提供商自动刷新，保留手动参数；空响应与故障保留旧列表，配置冲突跳过，写前保存模型快照。
- Add opt-in automatic API model catalogs, preserving manual metadata and backing up previous rows. Empty replies and failures retain the prior list; concurrent edits skip stale results.
- 即使自定义路由叫 `openai`，仍读取其实际端点，不用安装包内置目录替代；复用凭据服务和原有请求头。
- Query the configured endpoint even for a custom route named `openai`, retaining the credential service and deployment headers instead of substituting a built-in catalog.

## 0.1.0-rc.8.18 (2026-10-21)

- 修复模型设置页依赖已移除的表单 `mode` 字段而无法编辑或显示配置；权限跟随共享 Host 镜像，保留宿主写入队列和版本栅栏。
- 更新真实配置表单回归夹具，覆盖只读、缺失命名空间、无效值、读取失败及恢复。
- Fix model settings remaining read-only or losing values after removal of the form `mode` field; use the shared Host mirror permissions and retain queued, revision-fenced writes.
- Update real configuration form regression fixtures and cover read-only state, missing namespaces, invalid values, read failures and recovery.

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
