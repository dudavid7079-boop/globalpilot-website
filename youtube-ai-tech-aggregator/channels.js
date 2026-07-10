const draftKey = "techpulse-channel-draft";
const channelBoard = document.querySelector("#channelBoard");
const channelSummary = document.querySelector("#channelSummary");
const categoryFilter = document.querySelector("#categoryFilter");
const statusFilter = document.querySelector("#statusFilter");
const healthFilter = document.querySelector("#healthFilter");
const channelSearch = document.querySelector("#channelSearch");
const configOutput = document.querySelector("#channelConfigOutput");
const resetDraftButton = document.querySelector("#resetDraft");
const copyConfigButton = document.querySelector("#copyConfig");
const channelAddForm = document.querySelector("#channelAddForm");
const channelFormMessage = document.querySelector("#channelFormMessage");
const channelTestSummary = document.querySelector("#channelTestSummary");

let channels = [];
let channelTestResults = new Map();
let channelTestMeta = null;

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(draftKey) || "[]");
  } catch {
    return [];
  }
}

function saveDraft() {
  localStorage.setItem(draftKey, JSON.stringify(channels));
}

function normalizeFromSiteData(channel) {
  return {
    channelId: channel.channelId || channel.name.toLowerCase().replaceAll(" ", "-"),
    name: channel.name,
    category: channel.category || (channel.type?.includes("AI") ? "AI" : channel.type?.includes("评测") ? "Review" : "Platform"),
    weight: Number(channel.weight || 1),
    rssUrl: channel.rssUrl || "",
    handle: channel.handle || "",
    webUrl: channel.webUrl || "",
    status: channel.status || "active",
  };
}

function normalizeHandle(handle = "") {
  const trimmed = handle.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

function channelIdFromFallback(name, handle) {
  const source = handle || name;
  return source.toLowerCase().replace(/^@/, "").replace(/[^a-z0-9_-]+/g, "-").replace(/^-|-$/g, "");
}

function buildChannelUrls(channelId, handle) {
  return {
    rssUrl: channelId ? `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}` : "",
    webUrl: handle ? `https://www.youtube.com/${handle}/videos` : "",
  };
}

async function loadChannels() {
  const draft = readDraft();
  if (draft.length) return draft;

  try {
    const response = await fetch("./pipeline/channels.sample.json", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      return data.map((channel) => ({ ...channel, status: channel.status || "active" }));
    }
  } catch {}

  return (window.TechPulseData.channels || []).map(normalizeFromSiteData);
}

async function loadChannelTests() {
  try {
    const response = await fetch("./pipeline/channel-tests.json", { cache: "no-store" });
    if (!response.ok) return { meta: null, results: new Map() };
    const data = await response.json();
    return {
      meta: data,
      results: new Map((data.results || []).map((item) => [item.channelId, item])),
    };
  } catch {
    return { meta: null, results: new Map() };
  }
}

function channelType(category) {
  if (category === "AI") return "AI 科技先锋";
  if (category === "Review" || category === "Devices") return "综合科技评测";
  return "平台与开发者科技";
}

function renderCategoryOptions() {
  const categories = [...new Set(channels.map((channel) => channel.category))].sort();
  const selected = categoryFilter.value || "all";
  categoryFilter.innerHTML = [
    '<option value="all">全部</option>',
    ...categories.map((category) => `<option value="${category}">${category}</option>`),
  ].join("");
  categoryFilter.value = categories.includes(selected) ? selected : "all";
}

function filteredChannels() {
  const category = categoryFilter.value;
  const status = statusFilter.value;
  const health = healthFilter.value;
  const query = channelSearch.value.trim().toLowerCase();

  return channels.filter((channel) => {
    const matchesCategory = category === "all" || channel.category === category;
    const matchesStatus = status === "all" || (channel.status || "active") === status;
    const test = channelTestResults.get(channel.channelId);
    const matchesHealth =
      health === "all" ||
      (health === "ok" && test?.ok) ||
      (health === "failed" && test && !test.ok) ||
      (health === "untested" && !test);
    const text = [channel.name, channel.handle, channel.channelId, channel.category].join(" ").toLowerCase();
    return matchesCategory && matchesStatus && matchesHealth && (!query || text.includes(query));
  });
}

function renderSummary(visibleChannels) {
  const activeCount = channels.filter((channel) => (channel.status || "active") === "active").length;
  const categoryCount = new Set(channels.map((channel) => channel.category)).size;
  const failedCount = channels.filter((channel) => {
    const test = channelTestResults.get(channel.channelId);
    return test && !test.ok;
  }).length;

  channelSummary.innerHTML = [
    ["频道总数", channels.length],
    ["监控中", activeCount],
    ["分类数", categoryCount],
    ["测试失败", failedCount],
    ["当前显示", visibleChannels.length],
  ]
    .map(([label, value]) => `<article><span>${label}</span><b>${value}</b></article>`)
    .join("");
}

function formatDateTime(iso) {
  if (!iso) return "未知";
  return new Date(iso).toLocaleString("zh-CN", { hour12: false });
}

function renderTestSummary() {
  if (!channelTestMeta) {
    channelTestSummary.innerHTML = `
      <article>
        <div>
          <span class="section-label">Channel Health</span>
          <h2>尚未生成频道测试结果</h2>
          <p>运行 <code>RSS_RECENT_HOURS=168 node pipeline/test-channel.mjs pipeline/channels.sample.json pipeline/channel-tests.json</code> 后刷新页面。</p>
        </div>
      </article>
    `;
    return;
  }

  const failed = (channelTestMeta.results || []).filter((item) => !item.ok);
  const healthLabels = { all: "全部", ok: "测试通过", failed: "测试失败", untested: "未测试" };
  channelTestSummary.innerHTML = `
    <article>
      <div>
        <span class="section-label">Channel Health</span>
        <h2>${channelTestMeta.okCount}/${channelTestMeta.count} 个频道通过测试</h2>
        <p>最近测试：${formatDateTime(channelTestMeta.generatedAt)} · 窗口 ${channelTestMeta.recentHours} 小时 · 当前健康筛选：${healthLabels[healthFilter.value] || "全部"}</p>
      </div>
      <div class="channel-test-badges">
        <button class="good" type="button" data-health-jump="ok">${channelTestMeta.okCount} OK</button>
        <button class="${failed.length ? "bad" : "good"}" type="button" data-health-jump="failed">${failed.length} FAIL</button>
        <button type="button" data-health-jump="all">全部</button>
      </div>
      <p>${failed.length ? `需要检查：${failed.map((item) => item.name).join("、")}` : "全部频道都能发现近期视频。"}</p>
    </article>
  `;
}

function exportableChannels() {
  return channels.map((channel) => ({
    channelId: channel.channelId,
    name: channel.name,
    category: channel.category,
    weight: Number(channel.weight || 1),
    rssUrl: channel.rssUrl || `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`,
    handle: channel.handle || "",
    webUrl: channel.webUrl || (channel.handle ? `https://www.youtube.com/${channel.handle}/videos` : ""),
    status: channel.status || "active",
  }));
}

function updateExport() {
  configOutput.value = JSON.stringify(exportableChannels(), null, 2);
}

function renderChannels() {
  const visibleChannels = filteredChannels();
  renderSummary(visibleChannels);
  renderTestSummary();
  updateExport();

  if (!visibleChannels.length) {
    channelBoard.innerHTML = '<div class="empty-state"><h3>没有匹配频道</h3><p>调整筛选条件或重置草稿后再试。</p></div>';
    return;
  }

  const grouped = visibleChannels.reduce((acc, channel) => {
    const type = channelType(channel.category);
    acc[type] = acc[type] || [];
    acc[type].push(channel);
    return acc;
  }, {});

  channelBoard.innerHTML = Object.entries(grouped)
    .map(
      ([type, groupChannels]) => `
        <section class="channel-group">
          <div>
            <span class="section-label">${type}</span>
            <h2>${groupChannels.length} 个监控频道</h2>
          </div>
          <div class="channel-table editable-channel-table">
            ${groupChannels
              .map(
                (channel) => `
                  <article data-id="${channel.channelId}">
                    <div>
                      <strong>${channel.name}</strong>
                      <p>${channel.handle || channel.channelId} · ${channel.category}</p>
                      <p>${channel.webUrl || channel.rssUrl || "等待补充频道链接"}</p>
                      <p class="channel-test-result">${renderTestResult(channel)}</p>
                    </div>
                    <label>
                      权重
                      <input class="weight-input" type="number" min="0.2" max="2" step="0.01" value="${Number(channel.weight || 1)}" />
                    </label>
                    <span>${channel.status === "paused" ? "暂停" : "监控中"}</span>
                    <div class="channel-row-actions">
                      <button type="button" class="${channel.status === "paused" ? "" : "subscribed"}" data-action="toggle">
                        ${channel.status === "paused" ? "启用" : "暂停"}
                      </button>
                      <button type="button" data-action="test-info">测试</button>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      `
    )
    .join("");
}

function renderTestResult(channel) {
  const result = channelTestResults.get(channel.channelId);
  if (!result) return "未测试 · 运行 node pipeline/test-channel.mjs 生成结果";
  if (!result.ok) return `测试失败 · ${result.error || "未发现可用视频"}`;
  const sample = result.sampleVideos?.[0]?.title || "已发现视频";
  return `测试通过 · ${result.source} · ${result.videoCount} 条 · ${sample}`;
}

function updateChannel(id, patch) {
  channels = channels.map((channel) => (channel.channelId === id ? { ...channel, ...patch } : channel));
  saveDraft();
  renderChannels();
}

function setFormMessage(message, tone = "neutral") {
  channelFormMessage.textContent = message;
  channelFormMessage.dataset.tone = tone;
}

channelBoard.addEventListener("change", (event) => {
  if (!event.target.matches(".weight-input")) return;
  const row = event.target.closest("[data-id]");
  const weight = Number(event.target.value || 1);
  updateChannel(row.dataset.id, { weight });
});

channelBoard.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const row = button.closest("[data-id]");
  const action = button.dataset.action;
  const channel = channels.find((item) => item.channelId === row.dataset.id);

  if (action === "toggle") {
    updateChannel(row.dataset.id, { status: channel.status === "paused" ? "active" : "paused" });
    return;
  }

  if (action === "test-info") {
    const result = channelTestResults.get(channel.channelId);
    if (!result) {
      setFormMessage(`运行 CHANNEL_QUERY="${channel.name}" node pipeline/test-channel.mjs pipeline/channels.sample.json pipeline/channel-tests.json 后刷新页面。`, "neutral");
      return;
    }
    const status = result.ok ? "通过" : "失败";
    setFormMessage(`${channel.name} 测试${status}：${result.videoCount} 条，来源 ${result.source || "none"}。`, result.ok ? "success" : "error");
  }
});

[categoryFilter, statusFilter, healthFilter, channelSearch].forEach((control) => {
  control.addEventListener("input", renderChannels);
});

channelTestSummary.addEventListener("click", (event) => {
  const button = event.target.closest("[data-health-jump]");
  if (!button) return;
  healthFilter.value = button.dataset.healthJump;
  renderChannels();
});

resetDraftButton.addEventListener("click", async () => {
  localStorage.removeItem(draftKey);
  channels = await loadChannels();
  renderCategoryOptions();
  renderChannels();
});

channelAddForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(channelAddForm);
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "AI");
  const handle = normalizeHandle(String(formData.get("handle") || ""));
  const providedChannelId = String(formData.get("channelId") || "").trim();
  const channelId = providedChannelId || channelIdFromFallback(name, handle);
  const weight = Number(formData.get("weight") || 1);

  if (!name || (!handle && !providedChannelId)) {
    setFormMessage("请至少填写频道名，并提供 handle 或 Channel ID。", "error");
    return;
  }

  const duplicated = channels.some(
    (channel) =>
      channel.channelId.toLowerCase() === channelId.toLowerCase() ||
      (handle && channel.handle?.toLowerCase() === handle.toLowerCase())
  );
  if (duplicated) {
    setFormMessage("该频道已在监控池中。", "error");
    return;
  }

  const urls = buildChannelUrls(providedChannelId, handle);
  channels = [
    {
      channelId,
      name,
      category,
      weight,
      status: "active",
      rssUrl: urls.rssUrl,
      handle,
      webUrl: urls.webUrl,
    },
    ...channels,
  ];

  saveDraft();
  renderCategoryOptions();
  renderChannels();
  channelAddForm.reset();
  document.querySelector("#newChannelWeight").value = "1";
  setFormMessage(`${name} 已加入本地草稿。`, "success");
});

copyConfigButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(configOutput.value);
    copyConfigButton.textContent = "已复制";
  } catch {
    configOutput.focus();
    configOutput.select();
    copyConfigButton.textContent = "已选中";
  }
  setTimeout(() => {
    copyConfigButton.textContent = "复制 JSON";
  }, 1400);
});

Promise.all([loadChannels(), loadChannelTests()]).then(([loadedChannels, loadedTests]) => {
  channels = loadedChannels;
  channelTestMeta = loadedTests.meta;
  channelTestResults = loadedTests.results;
  renderCategoryOptions();
  renderChannels();
});
