export type EnglishService = {
  slug: string;
  label: string;
  title: string;
  shortTitle: string;
  description: string;
  outcome: string;
  bestFor: string[];
  deliverables: string[];
  process: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
};

export const englishServices: EnglishService[] = [
  {
    slug: "ai-website-builder",
    label: "AI Website",
    title: "AI Website Builder for Personal Brands and Small Teams",
    shortTitle: "AI Website Builder",
    description: "Launch a fast, searchable website with Markdown publishing, AI chat, Telegram lead alerts, and an SEO-ready content system.",
    outcome: "A production-ready personal brand or service website that can publish articles, capture demand, and turn conversations into qualified follow-ups.",
    bestFor: ["Consultants, creators, and indie builders", "Teams moving beyond Notion or social-only presence", "Founders who want long-term organic traffic"],
    deliverables: ["Next.js website and service pages", "Markdown blog with RSS, sitemap, and IndexNow", "Obsidian-to-GitHub publishing workflow", "AI chat connected to Telegram lead notifications"],
    process: ["Positioning and site structure", "Content and visual system", "Deployment, HTTPS, and analytics", "Publishing workflow handoff"],
    faqs: [
      {
        question: "How is an AI website different from a regular business website?",
        answer: "A regular website mainly presents information. An AI website combines positioning, content publishing, SEO, AI chat, lead routing, analytics, and automation so the site can become an operating system for growth.",
      },
      {
        question: "Do I need WordPress or a traditional CMS?",
        answer: "Not necessarily. For small teams and personal brands, a Next.js site with Markdown and Obsidian can be faster, cleaner, and easier to version than a heavy CMS.",
      },
      {
        question: "Can the AI chat use a local model instead of OpenAI?",
        answer: "Yes. GlobalPilot can connect to local Ollama models such as Qwen through a private network, while still keeping the website public and easy to maintain.",
      },
    ],
  },
  {
    slug: "ai-automation",
    label: "Automation",
    title: "AI Automation Consultant for Lean Digital Workflows",
    shortTitle: "AI Automation",
    description: "Turn repetitive messages, summaries, content tasks, and notifications into reliable workflows using AI, Telegram, n8n, Dify, and local models.",
    outcome: "A practical automation system that reduces manual handoffs, keeps humans in the loop, and makes repeated work easier to monitor.",
    bestFor: ["Teams handling repeated client messages", "Operators with tools that are not connected yet", "Builders who want local AI to reduce long-term API costs"],
    deliverables: ["Workflow audit and automation blueprint", "n8n or Dify workflow prototype", "Telegram or email notifications", "Local Ollama / Qwen integration when useful"],
    process: ["Workflow diagnosis", "Automation prototype", "Permissions and failure handling", "Monitoring and handoff"],
    faqs: [
      {
        question: "Which workflows should be automated first?",
        answer: "Start with high-frequency, rule-friendly tasks: lead summaries, message triage, meeting transcripts, first-draft content, form routing, and Telegram or email alerts.",
      },
      {
        question: "Can local AI and cloud AI APIs work together?",
        answer: "Yes. Local models are useful for cost control and privacy-sensitive tasks, while cloud APIs can handle harder reasoning, multimodal inputs, or production-grade reliability.",
      },
      {
        question: "How do you prevent AI automation from breaking things?",
        answer: "A good workflow includes logs, alerts, human approval points, retry logic, and rollback paths. The goal is not a black box; it is a system you can observe and control.",
      },
    ],
  },
  {
    slug: "global-growth",
    label: "Global Growth",
    title: "Global SEO and GEO Strategy for AI-Native Brands",
    shortTitle: "Global Growth",
    description: "Clarify positioning, search intent, content architecture, and AI search visibility for products and services entering global markets.",
    outcome: "A focused growth map: target audience, keyword clusters, content pillars, landing pages, calls to action, and a 90-day publishing rhythm.",
    bestFor: ["Chinese founders or creators going global", "Teams with unclear English positioning", "Products that need durable organic acquisition"],
    deliverables: ["Audience and positioning brief", "Keyword and search-intent map", "Service or product page structure", "12-week content plan"],
    process: ["Market and audience assumptions", "Keyword and competitor review", "Page and content planning", "Monthly measurement loop"],
    faqs: [
      {
        question: "Should global growth start with SEO or social media?",
        answer: "SEO compounds over time and captures intent. Social media is better for testing angles quickly. The strongest approach usually connects both into one content system.",
      },
      {
        question: "Is GEO different from SEO?",
        answer: "GEO focuses on being understandable and cite-worthy for AI answer engines. It overlaps with SEO, but puts more weight on definitions, structured answers, source clarity, and brand authority.",
      },
      {
        question: "Do I need English content from day one?",
        answer: "If your target buyers are outside China, start with a small English foundation: homepage, core service pages, and a few high-intent articles. Expand after data confirms demand.",
      },
    ],
  },
];

export function getEnglishService(slug: string) {
  return englishServices.find((service) => service.slug === slug) || null;
}
