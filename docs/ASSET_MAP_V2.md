# PerfectDay AI · v2 视觉素材映射

本文件记录最终一次上传的 v2 素材在网页中的用途。素材均位于 `public/images/`。

## 已接入正式网页

| 素材 | 页面 / 组件 | 用途 |
| --- | --- | --- |
| `hero/hero-desktop.webp` | `app/page.tsx` | 首页 PC Hero，>760px |
| `hero/hero-mobile.webp` | `app/page.tsx` | 首页手机 Hero，≤760px |
| `guide/guide-overview.webp` | `app/guide/page.tsx` | Guide 总览主视觉 |
| `malls/holiday-plaza.webp` | `app/guide/page.tsx` | 假日广场视觉导览 |
| `malls/mixc-shiqi.webp` | `app/guide/page.tsx` | 完美金鹰·石岐万象汇视觉导览 |
| `scenes/plan.webp` | `app/page.tsx` | 首页“出发前规划”能力说明 |
| `scenes/replan.webp` | `app/page.tsx` | 首页“途中重排”能力说明 |
| `states/loading.webp` | `app/loading.tsx` | 加载状态辅助插画 |
| `states/error.webp` | `app/error.tsx` | 错误重试状态 |
| `states/success.webp` | `app/components/trip/next-stop-panel.tsx` | 已完成行程的收尾状态 |
| `states/empty.webp` | `app/components/trip/next-stop-panel.tsx` | 当前条件下无后续地点的空状态 |
| `brand/favicon-32.png` | `app/layout.tsx` | 浏览器 favicon |
| `brand/apple-touch-icon.png` | `app/layout.tsx` | Apple Touch Icon |
| `brand/og-cover.jpg` | `app/layout.tsx` | Open Graph / 大图分享卡片 |
| `brand/app-icon-192.png` | `app/manifest.ts` | PWA 192 图标 |
| `brand/app-icon-512.png` | `app/manifest.ts` | PWA 512 图标 |
| `brand/maskable-icon-512.png` | `app/manifest.ts` | PWA maskable 图标 |

## 已上传、保留为备用视觉，不强行塞入正式页面

以下素材保留在仓库，适合后续 PPT、比赛截图、专题区块或小范围视觉升级。为避免正式网页变成“海报墙”，当前不默认展示。

- `scenes/coffee-friends.webp`：朋友聚会 / 咖啡甜品
- `scenes/family.webp`：亲子场景概念图
- `scenes/home-lifestyle.webp`：家居生活
- `scenes/explore.webp`：自由逛 / 公共空间
- `stickers/travel.png`：通用旅行生活贴纸
- `stickers/family.png`：家庭 / 家居贴纸
- `stickers/local.png`：本地商圈贴纸

## 响应式原则

- 首页 Hero 使用 `<picture>`：手机直接切换 `hero-mobile.webp`，不是把桌面大图硬裁成竖图。
- Guide 大图完整展示，商圈图保持 4:3。
- 状态插画在桌面端与功能文案并列，在手机端改为单列。
- 所有商圈建筑类图片均明确标注为 AI 手绘场景示意，不作为建筑实拍或门店实时信息。

## 旧素材

`public/images/city-afternoon.webp`、`coffee-reading.webp`、`play-together.webp` 暂时保留，当前新版首页不再依赖 `city-afternoon.webp`。待 v2 视觉上线并验证稳定后再决定是否清理，避免冻结阶段做无必要删除。
