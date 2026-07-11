import fs from "node:fs";

const seedsPath = process.argv[2] || "pipeline/product-seeds.json";
const siteDataPath = process.argv[3] || "data.generated.js";
const outPath = process.argv[4] || "product-data.generated.js";

function readJson(path, fallback) {
  if (!fs.existsSync(path)) return fallback;
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function readSiteData(path) {
  if (!fs.existsSync(path)) return { videos: [], generatedAt: new Date().toISOString() };
  const source = fs.readFileSync(path, "utf8");
  const match = source.match(/window\.TechPulseData\s*=\s*({[\s\S]*?});\s*\n\s*window\.TechPulseUtils/);
  if (!match) throw new Error(`Unable to parse TechPulse data from ${path}`);
  return JSON.parse(match[1]);
}

function scoreVideo(video) {
  return Math.round((Number(video.views || 0) + Number(video.likes || 0) * 5 + Number(video.comments || 0) * 10) / Math.pow(Number(video.publishedHours || 12) + 2, 1.65));
}

function matchVideos(seed, videos) {
  const keywords = seed.keywords.map((keyword) => keyword.toLowerCase());
  return videos
    .map((video) => {
      const haystack = `${video.topic} ${video.summary} ${(video.tags || []).join(" ")} ${video.channel}`.toLowerCase();
      const matches = keywords.filter((keyword) => haystack.includes(keyword));
      return { ...video, matches, score: scoreVideo(video) };
    })
    .filter((video) => video.matches.length)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function fallbackVideoProof(seed, videos) {
  const categoryMatch = videos.filter((video) => video.category === "AI" || video.category === seed.category).slice(0, 2);
  return categoryMatch.length ? categoryMatch : videos.slice(0, 2);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildProduct(seed, videos) {
  const matched = matchVideos(seed, videos);
  const proofVideos = matched.length ? matched : fallbackVideoProof(seed, videos);
  const videoBuzzRaw = proofVideos.reduce((sum, video) => sum + scoreVideo(video), 0);
  const videoWeight = clamp(Math.round(videoBuzzRaw / 1200), 12, 35);
  const freshnessBoost = proofVideos.some((video) => Number(video.publishedHours || 99) <= 24) ? 8 : 3;
  const signalScore = clamp(seed.githubWeight + seed.communityWeight + videoWeight + seed.freshnessWeight + freshnessBoost, 45, 98);
  const trend = signalScore >= 88 ? "+18" : signalScore >= 80 ? "+11" : "+6";
  const videoIds = proofVideos.map((video) => video.videoId).filter(Boolean);

  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    tagline: seed.tagline,
    signalScore,
    signalTrend: trend,
    sourceMix: {
      github: seed.githubWeight,
      community: seed.communityWeight,
      video: videoWeight,
      freshness: seed.freshnessWeight,
    },
    evidence: [
      seed.githubWeight >= 25 ? "GitHub 生态强" : "生态信号待跟踪",
      seed.communityWeight >= 25 ? "社区讨论活跃" : "社区观点持续采样",
      videoIds.length ? `${videoIds.length} 条视频证明` : "等待视频证明",
    ],
    quickTake: seed.quickTake,
    bestFor: seed.bestFor,
    notFor: seed.notFor,
    risks: seed.risks,
    github: { label: "技术生态", value: seed.githubWeight >= 25 ? "强信号" : "观察中", detail: seed.githubDetail },
    community: { label: "社区观点", value: seed.communityWeight >= 25 ? "高讨论" : "持续采样", detail: seed.communityDetail },
    videos: videoIds,
    keywords: seed.keywords,
  };
}

const seeds = readJson(seedsPath, []);
const siteData = readSiteData(siteDataPath);
const products = seeds.map((seed) => buildProduct(seed, siteData.videos || [])).sort((a, b) => b.signalScore - a.signalScore);

const js = `window.TechPulseProducts = ${JSON.stringify(
  {
    generatedAt: siteData.generatedAt || new Date().toISOString(),
    products,
  },
  null,
  2
)};
`;

fs.writeFileSync(outPath, js);
console.log(`Built ${products.length} products -> ${outPath}`);
