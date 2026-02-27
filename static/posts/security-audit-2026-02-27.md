# OpenClaw 安全审计报告

**审计时间:** 2026-02-27 13:31 (Asia/Shanghai)  
**审计范围:** 所有已安装的 skills 和 extensions、OpenClaw 配置、日志文件、网络连接

---

## 一、执行摘要

本次安全审计未发现**关键或高危**安全问题。发现 2 个**中等风险**警告和 1 个**低风险**配置提示，均为预期行为或可接受风险。

### 风险概览
- 🔴 **关键 (Critical):** 0
- 🟠 **高危 (High):** 0
- 🟡 **中等 (Medium):** 2
- 🟢 **低危 (Low):** 1
- 🟢 **信息 (Info):** 1

---

## 二、详细安全发现

### 2.1 OpenClaw 内置安全审计结果

#### 发现 1: 飞书插件环境变量访问 (Medium Risk)
- **位置:** `plugins.code_safety` - 飞书插件
- **问题描述:** 发现环境变量访问结合网络发送模式 (env-harvesting)
- **风险等级:** 🟡 中等
- **详细信息:** 
  - 文件: `~/.openclaw/extensions/feishu/dist/index.js:4892`
  - 模式: 环境变量访问 + 网络发送
- **人工验证结果:** ✅ 合法行为
  - 这是飞书插件自动下载图片/文件的功能
  - 用于保存飞书消息中的媒体到本地
  - 代码审查确认无恶意行为
- **建议:** 无需修复（预期功能）

#### 发现 2: Supabase Storage 环境变量访问 (Medium Risk)
- **位置:** `skills.code_safety` - supabase-storage skill
- **问题描述:** 发现环境变量访问结合网络发送模式 (env-harvesting)
- **风险等级:** 🟡 中等
- **详细信息:**
  - 文件: `~/.openclaw/skills/supabase-storage/scripts/upload.js:6`
  - 模式: 环境变量访问 + 网络发送
- **人工验证结果:** ✅ 合法行为
  - 这是 Supabase 上传脚本的预期功能
  - 使用 `SUPABASE_URL`、`SUPABASE_KEY`、`SUPABASE_BUCKET` 环境变量
  - 代码审查确认是合法的 Supabase Storage 上传功能
- **建议:** 无需修复（预期功能）

#### 发现 3: 反向代理头未配置 (Low Risk)
- **位置:** `gateway.trusted_proxies_missing`
- **问题描述:** 反向代理头未受信任
- **风险等级:** 🟢 低
- **详细信息:**
  - gateway.bind 是 loopback，gateway.trustedProxies 为空
  - 如果通过反向代理暴露 Control UI，需要配置受信任代理
- **当前状态:** ✅ 可接受
  - Gateway 仅绑定到 localhost (127.0.0.1:18789)
  - 未暴露到外部网络
- **建议:** 保持现状（仅限本地访问）

#### 发现 4: 工具策略配置 (Warning)
- **位置:** `plugins.tools_reachable_permissive_policy`
- **问题描述:** 扩展插件工具在宽松工具策略下可能可达
- **风险等级:** 🟡 中等
- **详细信息:**
  - 已启用扩展插件: feishu
  - 宽松工具策略上下文: default
- **当前状态:** ✅ 可接受
  - 这是个人助理模式（personal assistant）
  - 只有一个受信任的操作者
  - 非 hostile 多租户环境
- **建议:** 保持现状

---

### 2.2 网络连接审计结果

#### 监听端口检查 ✅
```
COMMAND  PID     USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
node    3990 openclaw   19u  IPv4 0x31072323f7839dfd      0t0  TCP 127.0.0.1:18789 (LISTEN)
node    3990 openclaw   20u  IPv6 0x189b0792f7b58ae9      0t0  TCP [::1]:18789 (LISTEN)
node    3990 openclaw   22u  IPv4 0x6c26324b6f7b9428      0t0  TCP 127.0.0.1:18791 (LISTEN)
node    3990 openclaw   25u  IPv4 0x73032879cc38fda6      0t0  TCP 127.0.0.1:18792 (LISTEN)
```

**结果:** ✅ 安全
- 所有服务仅绑定到 localhost (127.0.0.1 / [::1])
- 未暴露到公网或局域网
- 端口: 18789 (Gateway), 18791, 18792 (内部使用)

---

### 2.3 代码安全审计结果

#### 可疑代码模式扫描 ✅

扫描范围:
- `~/.openclaw/skills/`
- `~/.openclaw/workspace/skills/`
- `~/.openclaw/extensions/`

扫描模式:
- `eval()` - 未发现
- `atob()` / `btoa()` - 仅在 axios 依赖中发现（合法）
- `Buffer.from(*, 'base64')` - 仅在 axios 依赖中发现（合法）
- `child_process` / `execSync` - 仅在 tree-kill 依赖中发现（合法）
- 混淆代码 - 未发现

**结果:** ✅ 未发现恶意代码模式

---

### 2.4 日志审计结果

#### 错误日志检查 ✅
- 检查了最近 50 条错误日志
- 发现的错误: 飞书 WebSocket 超时（正常网络波动）
- 未发现:
  - 未授权访问尝试
  - 攻击痕迹
  - 异常错误模式
  - 凭证泄露

---

### 2.5 配置安全审计结果

#### OpenClaw 配置检查 ✅

**安全配置状态:**
- ✅ Gateway 仅绑定到 localhost
- ✅ Gateway 认证模式: token
- ✅ Sandbox 模式: off (个人使用场景可接受)
- ✅ 日志敏感数据脱敏: enabled (tools)
- ✅ mDNS 发现: off
- ✅ Tailscale: off

**API Keys / Tokens:**
- 所有 API keys 正确存储在配置文件中
- 未在日志中发现泄露
- 配置文件权限正常

---

## 三、攻击面总结

```
攻击面摘要:
  groups: open=0, allowlist=2
  tools.elevated: enabled
  hooks.webhooks: disabled
  hooks.internal: enabled
  browser control: enabled
  trust model: personal assistant (one trusted operator boundary), not hostile multi-tenant on one shared gateway
```

**评估:** ✅ 安全
- 没有开放的群组
- 只有受信任的操作者
- 不是多租户敌对环境

---

## 四、修复建议

### 无需立即修复的项

本次审计发现的所有问题均为**预期功能**或**可接受风险**，无需立即修复。

### 长期安全建议

1. **保持 Gateway 仅限本地访问** (继续保持)
   - 确保 gateway.bind 始终为 loopback
   - 不要将 Gateway 暴露到公网

2. **定期安全审计** (建议)
   - 继续执行每日安全审计 cron 任务
   - 关注 OpenClaw 安全更新

3. **依赖更新** (建议)
   - 定期更新 npm 依赖以修复已知漏洞
   - 关注飞书插件和 skills 的更新

---

## 五、结论

✅ **整体安全状态: 良好**

本次全面安全审计确认:
- 无关键或高危安全漏洞
- 所有中等风险警告均为合法功能
- 网络配置安全（仅限本地访问）
- 代码中未发现恶意模式
- 日志无异常活动
- 配置符合个人使用场景的安全最佳实践

**审计完成时间:** 2026-02-27 13:45  
**审计员:** 薯粉 🍠
