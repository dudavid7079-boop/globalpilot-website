export type Service = {
  slug: string;
  label: string;
  title: string;
  shortTitle: string;
  description: string;
  outcome: string;
  bestFor: string[];
  deliverables: string[];
  process: string[];
  example: {
    title: string;
    scenario: string;
    assets: string[];
    firstStep: string;
  };
};

export const services: Service[] = [
  {
    slug: "ai-website-builder",
    label: "AI Website",
    title: "AI 官网与内容系统",
    shortTitle: "AI Website Builder",
    description: "为个人品牌、顾问服务、独立产品和出海团队搭建一个可持续发布、可被搜索、可接住咨询线索的网站。",
    outcome: "上线一个具备品牌表达、SEO 内容、AI Chat、Telegram 通知和 Obsidian 发布流的生产级网站。",
    bestFor: ["正在做个人品牌或顾问业务", "需要从 Notion/社媒迁移到独立站", "想用 Blog 长期获得搜索流量"],
    deliverables: ["Next.js 品牌网站", "Markdown Blog 与 RSS / Sitemap", "Obsidian → GitHub → 自动发布", "AI Chat 与 Telegram 线索通知"],
    process: ["定位与页面结构", "视觉与内容系统", "部署与域名 HTTPS", "发布工作流培训"],
    example: {
      title: "个人品牌 AI 官网启动包",
      scenario: "适合已经有服务方向，但缺少独立官网、内容发布系统和咨询入口的创作者或顾问。",
      assets: ["首页 + About + Services + Blog", "首批 3-5 篇 SEO 文章规划", "Obsidian 发布模板", "AI Chat 线索入口与 Telegram 通知"],
      firstStep: "先用一次 30 分钟诊断，确定网站目标、核心服务和第一批内容栏目。",
    },
  },
  {
    slug: "ai-automation",
    label: "Automation",
    title: "业务自动化与 AI Agent",
    shortTitle: "AI Automation",
    description: "把重复的沟通、整理、转写、通知和内容生产流程，变成稳定运行的自动化系统。",
    outcome: "让表单、Telegram、n8n、Dify、Ollama、GitHub 等工具协同工作，减少人工搬运和漏单。",
    bestFor: ["每天重复处理客户消息或内容", "已经有工具但流程没有串起来", "希望用本地模型降低长期 AI 成本"],
    deliverables: ["流程梳理与自动化蓝图", "n8n / Dify 工作流", "Telegram / 邮件通知", "本地 Ollama / Qwen 接入"],
    process: ["流程诊断", "自动化原型", "权限与异常处理", "上线监控与交接"],
    example: {
      title: "AI 线索分诊与通知系统",
      scenario: "适合有网站、表单、社媒或私域入口，但线索分散、跟进慢、人工整理成本高的团队。",
      assets: ["线索收集入口", "AI 摘要与分类规则", "Telegram / 邮件实时通知", "异常告警和运行日志"],
      firstStep: "先列出 3 个最重复、最耗时、最容易漏掉的业务动作，判断哪些值得自动化。",
    },
  },
  {
    slug: "global-growth",
    label: "Global Growth",
    title: "全球增长与获客策略",
    shortTitle: "Global Growth",
    description: "帮助中文产品、服务和创作者把定位、内容、SEO 与海外用户路径讲清楚。",
    outcome: "形成一套可执行的海外获客入口：关键词、内容栏目、落地页、CTA 和持续发布节奏。",
    bestFor: ["准备面向海外用户或客户", "英文表达和页面结构不够清晰", "想把内容变成稳定获客资产"],
    deliverables: ["海外定位与信息架构", "关键词与内容地图", "服务页 / 产品页文案", "90 天内容发布计划"],
    process: ["市场与受众假设", "关键词与竞品拆解", "页面与内容规划", "持续复盘优化"],
    example: {
      title: "海外获客内容地图",
      scenario: "适合已有产品或服务，但不知道海外用户怎么搜索、怎么比较、为什么信任你的情况。",
      assets: ["目标用户与搜索意图拆解", "关键词分组", "服务页 / 产品页信息架构", "12 周内容发布计划"],
      firstStep: "先选择一个具体市场和一个核心服务，不从“全世界所有用户”开始。",
    },
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug) || null;
}
