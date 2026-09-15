# PerfectDay AI｜完美金鹰·假日商圈一体化随行助手

**商圈已经打通，PerfectDay AI 让体验也真正打通。**

PerfectDay AI 是一个移动端优先的商圈行程规划 PWA，聚焦中山完美金鹰·假日商圈。用户可以用一句话表达同行人、时间、预算和偏好，系统将阅读、咖啡、餐饮、购物、亲子与生活方式等互补内容组合成路线；下雨、走累、餐厅排队或预算变化后，只重排未完成部分，保留已经发生的行程。

## 核心能力

- **自然语言理解**：百炼 Qwen 负责把用户需求解析成场景、时长、预算、步行偏好与地点偏好。
- **确定性路线规划**：路线、预算、时间和地点真实性由本地点库与规则引擎控制。
- **途中状态维护**：完成、跳过和剩余预算/时间会持续记录。
- **只重排未来**：已完成部分保持不动，仅调整未完成路线。
- **商圈指南**：保留地点来源、查阅时间和到店提醒。
- **PWA**：支持添加到主屏幕和本地最近行程。

## 架构原则

项目采用“AI 理解 + 确定性执行”的混合架构：

```text
自然语言 / 表单
      ↓
Qwen 意图解析（可选）
      ↓
结构化 PlanInput
      ↓
本地点库 + Planner
      ↓
Journey 状态
      ↓
只重排未完成部分
```

Qwen 不直接生成商户事实、价格或完整路线。模型输出必须通过本地点 ID、场景、预算、时长和字段类型校验后才能进入规划器；模型不可用时自动回退到本地规则解析。

## 项目结构

```text
app/
├─ actions.ts                 # 服务端行程生成入口
├─ components/
│  ├─ home/                   # 首页规划表单与安装提示
│  ├─ trip/                   # 行程展示、进度、分享与时间线
│  ├─ adjust/                 # 剩余行程调整与预览
│  ├─ guide/                  # 商圈地点目录
│  ├─ header.tsx              # 全局导航
│  └─ ui-icon.tsx             # 轻量 SVG 图标
├─ trip/                      # 行程页面
├─ adjust/                    # 途中调整页面
└─ guide/                     # 商圈指南页面

config/
└─ site.ts                    # 品牌、路由、地图与素材配置

data/                         # 已核验地点与关闭地点数据
lib/                          # 规划、Journey、AI、地图与工具函数
types/                        # 领域类型
public/                       # 正式视觉素材与 PWA 图标
tests/                        # 规划器、AI、Journey 与静态资源回归测试
scripts/                      # 完整页面流程验证
```

## 页面

- `/`：需求输入与路线生成
- `/trip`：下一站、完整路线、地图、完成/跳过和进度记录
- `/adjust`：雨天、少走路、预算变化、排队等情况下重排未完成部分
- `/guide`：一体化商圈指南与地点来源

## 技术栈

- Next.js 16
- React 19
- TypeScript
- 纯 CSS 设计系统
- 阿里云百炼 Qwen
- 本地 TypeScript 地点数据
- 高德地图关键词 URI
- Vercel 部署

## 本地运行

```bash
npm ci
npm run dev
```

打开 `http://localhost:3000`。

## 质量检查

完整检查：

```bash
npm run check
```

也可以分别执行：

```bash
npm test
npm run typecheck
npm run build
npm run test:flow
```

GitHub Actions 会在 `main` 和 Pull Request 上执行同类检查，包括规划器回归测试、Journey 状态测试、AI fallback 测试、静态素材引用检查和完整页面流程验证。

## AI 调用逻辑

首页提交自然语言后，服务端先解析基础表单。配置 `DASHSCOPE_API_KEY` 且用户填写了自然语言时，调用百炼 `qwen-plus` 做结构化意图理解。

模型未配置、调用失败、超时、返回格式异常或触发应用侧防刷限制时，会自动回退到本地关键词解析与基础规划。路线生成和途中重排不依赖模型持续在线。

百炼配置见 [`docs/BAILIAN_SETUP.md`](docs/BAILIAN_SETUP.md)。

## 数据与真实性

地点来自项目维护的代表性地点样本库，不允许模型自行编造商户、地址、价格或实时状态。消费、停留和步行均为规划估算；营业、票价、实时排队、车位和精确无障碍通道未接入，现场情况以实际导视与商户信息为准。

多个连通口已启用，但项目不会把“已连通”进一步推断成“所有路径全程遮雨、无台阶或所有室内动线已核实”。

数据来源见 [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md)，地点核验记录见 [`docs/PLACE_VERIFICATION.md`](docs/PLACE_VERIFICATION.md)。

## 环境变量

至少需要：

```text
DASHSCOPE_API_KEY=your_key
```

可选：

```text
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DASHSCOPE_MODEL=qwen-plus
```

未配置 Key 时，应用仍可使用本地解析和确定性规划。
