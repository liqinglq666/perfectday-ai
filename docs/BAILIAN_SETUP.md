# 百炼接入：只填 API Key

## Vercel 部署

打开 Vercel 中导入 `liqinglq666/perfectday-ai` 的项目，进入 **Settings → Environment Variables**，添加：

| 名称 | 值 | 环境 |
| --- | --- | --- |
| `DASHSCOPE_API_KEY` | 你在百炼华北2（北京）创建的模型 API Key | Production；如需测试预览，可同时勾选 Preview |

保存后进入 **Deployments → 最新部署 → Redeploy**。环境变量只会对之后的新部署生效。

不要把 Key 填到 GitHub 文件、前端页面或 `NEXT_PUBLIC_` 变量中。这里接的是百炼模型 API，不需要新建百炼应用，不需要 App ID、数据库或地图 Key。

如果是首次导入仓库：Framework 选 **Next.js**，Root Directory 保持默认，Build Command 为 `npm run build`，Output Directory 保持框架默认。先填上述 Key，再点击 Deploy。

## 已预填的配置

| 项目 | 默认值 |
| --- | --- |
| 服务 | 阿里云百炼，华北2（北京） |
| 环境变量名 | `DASHSCOPE_API_KEY` |
| Base URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| HTTP 接口 | `POST /chat/completions` |
| 模型 | `qwen-plus` |
| 输出格式 | JSON Object，服务端校验字段和地点 ID |
| 深度思考 | 关闭（`enable_thinking: false`） |
| temperature | `0.2` |
| 最大输出 | `800` tokens |
| 请求超时 | `12` 秒；首页 Server Action 最大执行时长 `30` 秒 |
| 自动重试 | 无，每次提交最多一次模型请求 |
| 应用侧防刷 | 同一来源约 12 次/分钟、120 次/小时；超过后不调用模型，直接使用本地解析与基础规划 |

这些默认值在 `lib/bailian.ts` 与 `lib/ai-rate-limit.ts` 中生效，Vercel 无需再填写 Base URL 或模型名称。

应用侧限流按经过哈希的 IP 计数，改变 User-Agent 不会重置额度，不保存原始 IP 或用户文本。默认使用进程内计数；Serverless 多实例下，启用共享限流需要同时配置 `UPSTASH_REDIS_REST_URL` 与 `UPSTASH_REDIS_REST_TOKEN`（也支持现有的 `KV_REST_API_URL` / `KV_REST_API_TOKEN`）。这些是服务端变量，不可加 `NEXT_PUBLIC_` 前缀。

共享计数使用 Redis 原子脚本维护同一 IP 的分钟、小时额度，配置后所有实例使用相同的计数。配置缺失一半、连接超时或 Redis 拒绝请求时，不调用付费模型，直接回退本地规划。未配置 Redis 时仅提供单实例保护；百炼账户侧的消费/额度上限仍是最终成本保护。新增共享限流变量后需要重新部署。

如果 Key 来自新加坡而不是北京，请另外设置 `DASHSCOPE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1`，并重新部署。Key 必须与接口地域一致。也支持在 `DASHSCOPE_BASE_URL` 填写控制台提供的业务空间专属域名，以及用 `DASHSCOPE_MODEL` 覆盖模型；所选模型须支持非思考模式的 JSON 输出。

## 使用与核验

在首页输入“带父母逛四个小时，不喝咖啡，想逛宜得利，尽量待在室内”，点击 **生成行程**。

- 成功调用并通过校验：行程页显示 **已按 AI 理解的偏好规划**。
- 没有配置 Key，或只选择表单选项、没有输入文字：使用 **基础路线规划**，不发起模型请求。
- Key 无效、超时、额度、限流或模型响应异常：使用本地解析/基础规划，不让模型可用性阻断路线生成。

百炼只解析出行意图；商户、地址、图片、时间与消费估算仍来自现有地点库及规则。模型可以选择已知地点、排除不想去的地点，但不能添加商户或修改资料。它不会联网查询实时营业、天气或排队。

解析后的偏好随行程链接传递。刷新、分享链接、打开调整页及点击四种调整选项，都不会再次调用模型。首页快捷示例只在用户提交文字需求时触发一次理解；PWA manifest 不再提供额外长按快捷路线入口。

表单保留原有预算档位，文字中的精确预算（如50元）另存为硬上限，并用于行程余额；分钟、小时及混合时长均参与约束，最多规划480分钟。默认14:00出发，可在途中调整页修改时间。天气条件与同行人分别处理，雨天亲子仍保留亲子需求。商业模型调用按百炼账户权益和计费规则处理，未配置 Key 时可继续使用本地功能。

## 出错时查看

在 Vercel 项目日志搜索 `[bailian]`：

| 日志 | 检查内容 |
| --- | --- |
| `upstream_status=401` | Key 是否正确、是否与接口地域一致 |
| `upstream_status=403` | 模型权限、服务是否开通或账户限制 |
| `upstream_status=429` | 调用频率及账户额度 |
| `upstream_status=400` / `404` | 模型名称、Base URL 和参数兼容性 |
| `timeout` / `request_failed` | 网络连通性或服务响应；稍后重试 |
| `invalid_response` / `invalid_intent` | 模型未返回完整、合法的结构化结果，已自动回退 |

日志仅记录状态，不记录 Key、请求文本或上游完整错误内容。应用侧限流命中后不会继续请求百炼，因此也不会产生百炼上游 429 日志。

## 本地运行（可选）

```bash
cp .env.example .env.local
# 编辑 .env.local，只填写 DASHSCOPE_API_KEY
npm ci
npm run dev
```

`.env.local` 已被 Git 忽略。修改环境变量后重启开发服务。

## 官方参考

- [百炼 OpenAI 兼容接口与地域配置](https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope)
- [百炼 JSON 结构化输出](https://help.aliyun.com/zh/model-studio/qwen-structured-output)
- [获取 API Key](https://help.aliyun.com/zh/model-studio/get-api-key)
- [Vercel 环境变量](https://vercel.com/docs/environment-variables)
- [Upstash Redis REST API](https://upstash.com/docs/redis/features/restapi)
