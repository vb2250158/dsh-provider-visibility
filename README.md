# dsh-provider-visibility

控制模型下拉中显示哪些提供方，并保存设置。

## 0.1.0-rc.8.10

“模型列表”新增可移除的模型重定向规则。指定模型规则优先于提供商全部模型规则；目标始终为选定的提供商和模型，每次请求只匹配一次，不递归应用后续规则。原会话选择保留，删除规则后下一次请求恢复原路由。正在装配的请求使用已捕获的规则，后续修改从下一步生效。

来源和目标选择复用 `dsh-codex-model-selector` 的搜索下拉，启用该插件后即可编辑规则。选择下拉仅修改规则草稿，不调用会话的模型切换接口。重定向保留推理档位；目标不可用或拒绝该档位时请求失败，不自动回退。

重定向通过公开 `system-prompt/assemble` 和 `agent/request` 扩展点生效。原选择记录为 `model/selection`，重定向通知记录为插件来源的 `user/message`，实际调用继续由标准 `request/header` 和模型回复来源记录。通知也进入模型上下文，说明本次路由。`modelRedirects` 投影按回复 id 关联记录，`dsh-chat-enhancement` 显示实际模型和“已重定向”标记，悬停可看“来源 → 实际使用”；后续规则或下拉变化不改历史记录。没有通知的旧回复不推测重定向来源。

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
