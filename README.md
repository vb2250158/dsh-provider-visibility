# dsh-provider-visibility

This release requires DSH 0.2.1-rc.3 or later with the public `agent/resolve-model` step-selection event. See [compatibility details](docs/dsh-0.2-compatibility.md).

## API 模型自动同步 / Automatic API model catalogs

在插件配置的 `modelSync.targets` 中指定 `{ settingsNs, provider }`，为有明确 `baseURL` 和 `api` 的自定义 API 提供商启用同步。默认目标为空，不自动改动其它提供商。启动或启用时读取一次，之后每 `intervalMs`（默认 300000 毫秒）刷新；单次查询上限为 `timeoutMs`（默认 10000 毫秒）。查询直连所配置的 OpenAI 兼容或 Anthropic 端点，复用凭据服务和原有请求头；即使路由名与内置提供商相同，也不用安装包目录替代。订阅提供商继续管理自己的目录。

Opt in custom API routes with `{ settingsNs, provider }` entries in the plugin's `modelSync.targets`; each route must configure an explicit `baseURL` and `api`. No routes are selected by default. Discovery runs at startup, when enabled, and every `intervalMs` (300000 ms by default), with a `timeoutMs` request limit (10000 ms by default). It queries the configured OpenAI-compatible or Anthropic endpoint using the credential service and deployment headers, even when the route shares a built-in provider's name. Subscription providers retain their own catalogs.

成功同步后，列表与 API 返回的模型 ID 对齐；已有模型的名称、上下文、输出、视觉和推理参数保持用户配置，新模型采用 API 提供的元数据。空列表或查询失败保留上次目录，下次自动重试；提供商逐个隔离。查询期间用户编辑过该提供商时跳过本次保存，写入使用最新设置版本；无变化不写盘。每次变更前在 profile 的 `.model-catalog-backups/` 保存原模型列表，文件只含目标身份和模型行；恢复时将对应 `models` 写回原提供商，`null` 表示原来未配置此字段。保存会触发官方配置事件，已打开的模型选择器同步更新。停止自动刷新时清空目标数组。最近一次同步结果保存在同目录的 `*-status.json`，只记录固定状态标签、阶段、时间和模型数，不保存异常正文或凭据。

A successful refresh adopts the endpoint's model ids. Existing rows retain their manual name, context, output, vision and reasoning settings; new rows adopt disclosed metadata. Empty replies and failures retain the last catalog and retry on the next interval. Routes fail independently. Concurrent provider edits skip the stale refresh, writes use the latest settings revision, and unchanged lists do not write. Before each change, `.model-catalog-backups/` beside the profile patch receives the prior model list and target identity only; restore its `models` to the same provider (`null` means the field was originally absent). Standard configuration events refresh open model selectors. Clear the target array to disable refreshing. The latest outcome is saved in `*-status.json` in the same directory, containing fixed outcome and phase labels, time and model count, without exception text or credentials.

## 0.1.0-rc.8.19

重定向在工具条件和提示词装配前通过 `agent/resolve-model` 固定本步骤的有效选择。用户的原模型与显式推理档位保留；删除规则后下一步恢复来源，装配期间的新选择不被旧步骤覆盖。请求、重试、工具条件、提示词和实际回复使用同一路由。目标不支持该档位时明确失败，不回退。缺少该公开入口的旧 DSH 会在加载时报错，应先同步维护的 DSH 源码补丁。

Resolve redirects before tools and prompt assembly, preserving the user's source selection and explicit effort. Removing a rule restores the source on the next step; a newer choice made while validation waits remains pending. Tools, prompt, request headers, replies and retries share the captured effective selection. Invalid targets fail without fallback. Older DSH drivers without model-resolution capability version 1 fail at plugin load with an actionable compatibility error.

## 0.1.0-rc.8.17

修复当前 DSH 配置接口下模型重定向与提供商开关一直禁用的问题。浏览器从共享配置镜像解析插件字段，保存仍走宿主的校验、版本检查和写入队列；原隐藏列表及规则保持不变。加载、保存成功和失败均显示反馈；规则与提供商分区呈现，窄屏改为单列。

Fix disabled model redirects and provider switches with the current DSH configuration API. The browser decodes plugin values from the shared mirror; Host validation, revision checks and the shared write queue remain in effect. Existing settings are preserved. Loading and save results are visible, with separate routing and provider sections and a single-column narrow layout.

## 0.1.0-rc.8.11

修复模型列表勾选框和重定向选择器一直禁用：客户端使用明确的设置值解析器，不执行序列化后失去闭包的校验函数。保留主机写入校验、原有隐藏列表及规则；无需迁移设置数据。

控制模型下拉中显示哪些提供方，并保存设置。

## 0.1.0-rc.8.10

“模型列表”新增可移除的模型重定向规则。指定模型规则优先于提供商全部模型规则；目标始终为选定的提供商和模型，每次请求只匹配一次，不递归应用后续规则。原会话选择保留，删除规则后下一次请求恢复原路由。正在装配的请求使用已捕获的规则，后续修改从下一步生效。

来源和目标选择复用 `dsh-codex-model-selector` 的搜索下拉，启用该插件后即可编辑规则。选择下拉仅修改规则草稿，不调用会话的模型切换接口。重定向保留推理档位；目标不可用或拒绝该档位时请求失败，不自动回退。

重定向通过公开 `agent/resolve-model` 在步骤准备前生效，`agent/request` 只写通知，不改路由。原选择记录为 `model/selection`，重定向通知记录为插件来源的 `user/message`，实际调用继续由标准 `request/header` 和模型回复来源记录。通知也进入模型上下文，说明本次路由。`modelRedirects` 投影按回复 id 关联记录，`dsh-chat-enhancement` 显示实际模型和“已重定向”标记，悬停可看“来源 → 实际使用”；后续规则或下拉变化不改历史记录。没有通知的旧回复不推测重定向来源。

## 安装

`runningModelRedirect` 从相同的已存档通知投影当前轮次和步骤的重定向信息；下一步骤开始清除旧通知。运行状态组件必须同时匹配请求的轮次、步骤及实际目标，才显示重定向标记。

锁定公开仓库的提交后，通过 DSH 官方入口安装：

```powershell
pnpm dsh plugin --profile web add github:vb2250158/dsh-provider-visibility#<commit>
```

插件包声明 `dsh.bundle`，安装后会把自己的配置层加入 profile。

## 配置

插件配置保存在 DSH profile 的 `cordis.patch.yml`。多电脑同步仓库只保存仓库地址、固定提交、启停状态和配置，不保存本仓库源码。

## 验证

```powershell
npm test
npm run build
npm pack --dry-run
```

从 DSH 源码开发时，先设置 `DSH_SOURCE_ROOT` 为当前 DSH 工作区；Host 测试使用该工作区的真实 Session 与 AgentLoop，模拟适配器不访问外部模型。构建同步生成 Host、Client 与类型声明。依赖诊断与本插件诊断分开，不能把插件检查通过称为整个 DSH 工作区类型检查通过。

## 许可证

MIT

Local integration uses the current client-store and declares remote.session injection. The settings page reads the global model catalog, so a pending or absent session does not hide available providers.

## Plugin display metadata

The plugin list shows **Model visibility** in English and **模型列表** in Chinese, following the DSH interface language. `locale/en.json` and `locale/zh.json` provide the title and description; `icon.svg` supplies self-contained artwork. The package exports and publishes these resources. The icon is adapted from Lucide; see [ICON_LICENSE.txt](ICON_LICENSE.txt).

## 插件设置入口

在插件列表中点击本插件进入详情页，即可使用原有配置和操作界面；设置菜单不再重复显示该插件入口。

The icon uses a centered 36 × 36 viewBox to leave more space around the artwork inside the plugin icon frame.
