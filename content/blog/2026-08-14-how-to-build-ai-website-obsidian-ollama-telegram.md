---
title: How to Build an AI Website with Obsidian, Ollama, and Telegram
date: 2026-08-14
description: A practical guide to building an AI-native personal website with a Markdown blog, Obsidian publishing workflow, local Ollama models, and Telegram lead notifications.
tags: [AI, Website, Ollama, Obsidian, Automation]
---

# How to Build an AI Website with Obsidian, Ollama, and Telegram

An AI website is not just a normal website with a chatbot added at the end.

The better version is a small operating system:

- a fast website people can find through search
- a blog you can update without logging into a heavy CMS
- an AI assistant that helps visitors clarify what they need
- a private notification channel where serious conversations can be followed up
- a deployment workflow that does not require manual server work every time you publish

This is the architecture I use for GlobalPilot:

```text
Obsidian
↓
GitHub
↓
VPS / Docker / Nginx Proxy Manager
↓
Next.js website
↓
Ollama + Qwen on a local Mac mini
↓
Telegram lead notifications
```

It is intentionally simple. The goal is not to build the most complex stack. The goal is to build something that can stay online, publish consistently, and turn vague interest into useful conversations.

## What makes a website AI-native?

A normal website usually answers one question:

```text
What do you offer?
```

An AI-native website answers a better set of questions:

```text
What problem does the visitor have?
What context do they bring?
What should they do next?
Should a human follow up?
```

That means the website needs more than pages. It needs a content system, a conversation layer, and an operational backend.

For a personal brand, consultant, indie builder, or small service team, this can be surprisingly lightweight.

## The core stack

Here is the practical version of the stack.

```text
Frontend: Next.js
Content: Markdown files
Writing app: Obsidian
Version control: GitHub
Deployment: Docker on a VPS
Reverse proxy: Nginx Proxy Manager
Local AI: Ollama + Qwen
Private network: Tailscale
Notifications: Telegram Bot
Analytics: Umami
Indexing: Sitemap + RSS + IndexNow
```

Each tool has a clear role.

Next.js handles the public website, blog, service pages, API routes, sitemap, RSS, metadata, and structured data.

Obsidian is the writing interface. Instead of logging into WordPress or Notion, you write a Markdown file and sync it to GitHub.

Ollama runs the AI model locally. In GlobalPilot's case, the website talks to a Qwen model running on a Mac mini through a private network.

Telegram is the human follow-up layer. When someone uses the AI chat, the conversation can be summarized and sent to a private Telegram chat for review.

## Why use Obsidian for publishing?

For a small site, the best CMS is often a folder.

GlobalPilot stores blog posts like this:

```text
content/blog/
  2026-07-05-seo-geo-guide.md
  2026-07-14-tool-site-business-models.md
  2026-08-14-how-to-build-ai-website-obsidian-ollama-telegram.md
```

Each article starts with frontmatter:

```markdown
---
title: How to Build an AI Website with Obsidian, Ollama, and Telegram
date: 2026-08-14
description: A practical guide to building an AI-native personal website.
tags: [AI, Website, Ollama, Obsidian, Automation]
---
```

This gives you a few advantages:

- the content is portable
- every change is versioned in Git
- the website can generate pages, RSS, and sitemap automatically
- Obsidian remains the writing environment
- no database is required for the blog

The daily publishing flow becomes:

```text
Write in Obsidian
↓
Commit and sync
↓
GitHub receives the update
↓
The VPS rebuilds the website
↓
The article goes live
↓
IndexNow submits the updated URLs
```

That is the kind of workflow a solo builder can actually maintain.

## Why run AI locally with Ollama?

Cloud AI APIs are powerful, but they are not always necessary for every website interaction.

For many website chat use cases, a local model is good enough:

- qualifying a visitor's request
- suggesting next steps
- summarizing a conversation
- helping users navigate services
- drafting a short response

Ollama makes this practical. You can run a model such as Qwen on a Mac mini and expose it only through a private network such as Tailscale.

The public website never needs to expose Ollama directly to the internet.

The safer architecture looks like this:

```text
Visitor
↓
GlobalPilot website
↓
Server-side API route
↓
Private Tailscale IP
↓
Ollama on Mac mini
```

This keeps the AI endpoint private while still letting the website use local inference.

## Why send chat context to Telegram?

A website chat interface is useful, but it is not enough by itself.

If a visitor says something meaningful, you need to know about it quickly. Telegram is a simple bridge between AI interaction and human follow-up.

The flow is:

```text
Visitor sends a message
↓
AI responds
↓
The conversation is summarized
↓
Telegram bot sends the summary to a private chat
↓
Human decides whether to follow up
```

This is especially useful for consultants, agencies, and personal brands because not every lead needs a CRM on day one. A private Telegram channel is often enough to start.

## The SEO layer

An AI website still needs traditional SEO fundamentals.

At minimum, the site should have:

- clean URLs
- title and description metadata
- canonical URLs
- sitemap.xml
- robots.txt
- RSS feed
- Open Graph tags
- article structured data
- service structured data
- FAQPage schema for commercial pages
- internal links between related articles and service pages

For GlobalPilot, IndexNow is also useful. After deployment, the site can submit updated URLs to search engines that support IndexNow.

This does not guarantee ranking. It simply helps search engines discover updates faster.

## The GEO layer

GEO means Generative Engine Optimization. It is content optimization for AI answer engines.

For an AI-native website, GEO matters because users increasingly ask tools like ChatGPT, Perplexity, Gemini, Claude, or AI search interfaces for recommendations.

To make content easier for AI systems to understand, each page should include:

- clear definitions
- direct answers
- step-by-step explanations
- examples
- FAQ sections
- consistent author and brand signals
- structured data
- internal links that show topical depth

In other words, write pages that are easy for both humans and machines to quote.

## A practical build sequence

If you want to build this kind of website, do not start with everything at once.

Start with the smallest system that can publish and capture demand:

```text
Step 1: Build the Next.js website
Step 2: Add Markdown blog support
Step 3: Add sitemap, RSS, and metadata
Step 4: Connect Obsidian to GitHub
Step 5: Deploy with Docker on a VPS
Step 6: Add AI chat
Step 7: Connect Ollama through a private network
Step 8: Send useful conversations to Telegram
Step 9: Add analytics
Step 10: Improve SEO and GEO over time
```

This sequence matters. If you add AI before the content system, you may get a flashy demo but no long-term distribution. If you add automation before you understand the visitor journey, you may automate the wrong thing.

The website should become clearer every week.

## Common mistakes

The most common mistake is treating the AI chat as the product.

It is not. The product is the complete system:

```text
Positioning
↓
Content
↓
Traffic
↓
Conversation
↓
Follow-up
↓
Learning
```

Another mistake is exposing local AI services directly to the public internet. If Ollama is running on your Mac mini, keep it private. Use server-side routes, private networking, and access control.

A third mistake is publishing content without internal links. A blog post should not be an isolated page. It should connect to services, related posts, and next steps.

## What this unlocks

Once this system is running, you can use it for more than a personal homepage.

You can turn YouTube transcripts into articles. You can expand social posts into blog posts. You can use AI to draft outlines, then edit them in Obsidian. You can send qualified leads to Telegram. You can improve service pages based on analytics.

The result is a small but durable growth machine.

Not huge. Not over-engineered. Just useful.

That is the real advantage of an AI website: it helps your ideas travel further without forcing you to babysit a complex CMS or a fragile automation chain.

If you are building a personal brand, consulting offer, or AI service business, this is a good starting architecture.
