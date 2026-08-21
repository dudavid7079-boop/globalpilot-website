# GlobalPilot SEO Playbook

这份清单用于日常发文、页面优化和月度复盘。目标不是“堆 SEO 技巧”，而是让搜索引擎和 AI 搜索工具更容易理解 GlobalPilot 提供什么、适合谁、解决什么问题。

## 当前已完成

- `robots.txt` 指向 `sitemap.xml`
- `sitemap.xml` 覆盖首页、About、Services、服务详情页、Blog 和所有文章
- `feed.xml` 支持 RSS 订阅
- IndexNow 已接入，部署后自动提交 URL
- 站点级 `Organization` / `WebSite` 结构化数据
- 文章页 `BlogPosting` + `BreadcrumbList` 结构化数据
- 服务页 `Service` + `BreadcrumbList` 结构化数据
- 文章页底部增加相关文章内链
- 页面 canonical、Open Graph、Twitter Card 已配置
- `llms.txt` 和 `llms-full.txt` 已生成，帮助 AI 搜索和 LLM crawler 快速理解站点结构

## 每次发布文章前

1. 标题清楚表达搜索意图，例如“如何用 AI 搭建企业官网”，不要只写抽象标题。
2. Frontmatter 必填：
   - `title`
   - `date`
   - `description`
   - `tags`
3. 第一屏说明这篇文章解决什么问题、适合谁。
4. 至少加入 2-3 个内部链接：
   - 链到相关服务页
   - 链到上一篇/相关主题文章
   - 链到 `/chat` 作为咨询入口
5. 发布后确认：

```bash
npm run validate:content
npm run seo:indexnow
```

## 每月复盘

1. 在 Umami 看访问最多的文章和入口页。
2. 在 Search Console / Bing Webmaster Tools 看：
   - 展示量增长的关键词
   - 点击率低但排名有机会的页面
   - 已收录 / 未收录页面
3. 给表现好的文章补充：
   - FAQ 小节
   - 案例
   - 内链
   - 更具体的 CTA
4. 把高潜力主题扩展成专题集群，例如：
   - AI Website Builder
   - Local AI / Ollama
   - Obsidian publishing workflow
   - GEO / AI Search Optimization

## 下一批推荐优化

1. 接入 Google Search Console 和 Bing Webmaster Tools。
2. 增加英文入口页 `/en`，承接海外关键词。
3. 服务页增加 FAQ 区块，并输出 `FAQPage` schema。
4. 给重点文章增加原创图或流程图，提升分享点击率。
5. 将高价值文章拆成系列文章，形成 topic cluster。
