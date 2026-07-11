const productState = window.TechPulseProducts || { products: [] };
const productVideos = window.TechPulseData?.videos || [];
const productDirectory = document.querySelector("#productDirectory");
const productDetail = document.querySelector("#productDetail");
const productSearch = document.querySelector("#productSearch");
const productCategory = document.querySelector("#productCategory");
const watchOnly = document.querySelector("#watchOnly");
const WATCHLIST_KEY = "techpulse-product-watchlist";

const productFilters = {
  query: "",
  category: "all",
  watchOnly: false,
};

function readWatchlist() {
  return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
}

function saveWatchlist(items) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
}

function productById(id) {
  return productState.products.find((product) => product.id === id) || productState.products[0];
}

function productHaystack(product) {
  return [product.name, product.category, product.tagline, product.quickTake, ...(product.keywords || []), ...(product.evidence || [])].join(" ").toLowerCase();
}

function filteredProducts() {
  const query = productFilters.query.trim().toLowerCase();
  return productState.products.filter((product) => {
    const categoryMatch = productFilters.category === "all" || product.category === productFilters.category;
    const queryMatch = !query || productHaystack(product).includes(query);
    const watchMatch = !productFilters.watchOnly || isWatching(product.id);
    return categoryMatch && queryMatch && watchMatch;
  });
}

function isWatching(productId) {
  return readWatchlist().some((item) => item.id === productId);
}

function toggleWatchProduct(product) {
  const items = readWatchlist();
  const existing = items.find((item) => item.id === product.id);
  const next = existing
    ? items.filter((item) => item.id !== product.id)
    : [
        ...items,
        {
          id: product.id,
          name: product.name,
          category: product.category,
          keywords: product.keywords,
          addedAt: new Date().toISOString(),
        },
      ];
  saveWatchlist(next);
  window.TechPulseAnalytics?.track(existing ? "product_unwatch_click" : "product_watch_click", {
    productId: product.id,
    category: product.category,
  });
}

function relatedVideos(product) {
  const ids = new Set(product.videos || []);
  const keywords = (product.keywords || []).map((keyword) => keyword.toLowerCase());
  return productVideos
    .filter((video) => {
      const haystack = `${video.topic} ${video.summary} ${video.tags.join(" ")} ${video.channel}`.toLowerCase();
      return ids.has(video.videoId) || keywords.some((keyword) => haystack.includes(keyword));
    })
    .slice(0, 3);
}

function renderDirectory(activeId) {
  const products = filteredProducts();
  const content = products.length
    ? products
        .map(
          (product, index) => `
            <button class="${product.id === activeId ? "active" : ""}" data-product-id="${product.id}">
              <b>${String(index + 1).padStart(2, "0")}</b>
              <span>
                <strong>${product.name}</strong>
                <small>${product.category} · Score ${product.signalScore}</small>
              </span>
            </button>
          `
        )
        .join("")
    : `<div class="empty-state compact-empty"><h3>没有匹配产品</h3><p>换个关键词，或关闭“只看已关注”。</p></div>`;
  productDirectory.innerHTML = content;
}

function renderCategoryOptions() {
  if (!productCategory) return;
  const categories = [...new Set(productState.products.map((product) => product.category))].sort();
  productCategory.innerHTML = [`<option value="all">全部分类</option>`, ...categories.map((category) => `<option value="${category}">${category}</option>`)].join("");
}

function metricBlock(label, value, detail) {
  return `
    <article>
      <span>${label}</span>
      <b>${value}</b>
      <p>${detail}</p>
    </article>
  `;
}

function renderDetail(productId) {
  const products = filteredProducts();
  const requested = productById(productId);
  if (!products.length) {
    renderDirectory(requested?.id);
    productDetail.innerHTML = `
      <section class="empty-state product-empty-state">
        <h3>没有匹配的产品档案</h3>
        <p>可以清空搜索、切换分类，或先取消“只看已关注”。TechPulse 会在后续刷新中继续扩展产品实体库。</p>
      </section>
    `;
    return;
  }

  const product = products.find((item) => item.id === requested?.id) || products[0];
  if (!product) return;
  const videos = relatedVideos(product);
  renderDirectory(product.id);

  productDetail.innerHTML = `
    <div class="product-detail-head">
      <div>
        <span class="section-label">${product.category}</span>
        <h2>${product.name}</h2>
        <p>${product.tagline}</p>
        <div class="product-actions">
          <button class="button primary" type="button" data-product-watch="${product.id}">
            ${isWatching(product.id) ? "已关注该产品" : "关注产品信号"}
          </button>
          <a class="button secondary" href="./subscribe.html?product=${product.id}" data-analytics-event="product_subscribe_click" data-analytics-action="product_detail" data-product-id="${product.id}" data-category="${product.category}">订阅关键词</a>
        </div>
      </div>
      <div class="signal-score">
        <span>Signal</span>
        <b>${product.signalScore}</b>
        <small>${product.signalTrend} today</small>
      </div>
    </div>

    <section class="quick-take">
      <h3>3 秒看懂</h3>
      <p>${product.quickTake}</p>
      <div class="product-tags">
        ${product.evidence.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </section>

    <section class="signal-mix">
      ${metricBlock("GitHub", `${product.sourceMix.github}%`, product.github.detail)}
      ${metricBlock("社区讨论", `${product.sourceMix.community}%`, product.community.detail)}
      ${metricBlock("视频证明", `${product.sourceMix.video}%`, videos.length ? "已有可读中文视频摘要，可作为产品实机证明。" : "等待下一轮视频同步。")}
      ${metricBlock("新鲜度", `${product.sourceMix.freshness}%`, "按最近 24-72 小时新增信号加权。")}
    </section>

    <section class="fit-grid">
      <article>
        <h3>适合谁</h3>
        <ul>${product.bestFor.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article>
        <h3>不适合谁</h3>
        <ul>${product.notFor.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article>
        <h3>主要风险</h3>
        <ul>${product.risks.map((item) => `<li>${item}</li>`).join("")}</ul>
      </article>
    </section>

    <section class="video-intelligence">
      <div class="section-heading compact-heading">
        <span class="section-label">Video Proof</span>
        <h3>海外视频情报摘要</h3>
        <p>大陆可读模式优先展示中文摘要和关键点；原视频仅作为来源链接。</p>
      </div>
      <div class="video-proof-list">
        ${
          videos.length
            ? videos
                .map(
                  (video) => `
                    <article>
                      <span>${video.channel} · ${video.category}</span>
                      <h4>${video.topic}</h4>
                      <p>${video.summary}</p>
                      <a class="detail-link" href="./topics.html?id=${video.videoId}" data-analytics-event="product_video_summary_click" data-analytics-action="product_detail" data-video-id="${video.videoId}" data-category="${product.category}">查看视频摘要</a>
                    </article>
                  `
                )
                .join("")
            : `<article class="empty-state"><h3>暂无匹配视频</h3><p>下一轮刷新会继续用关键词和实体对齐补充视频证明。</p></article>`
        }
      </div>
    </section>
  `;
}

productDirectory.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const productId = button.dataset.productId;
  history.replaceState(null, "", `./products.html?id=${productId}`);
  window.TechPulseAnalytics?.track("product_select", { productId });
  renderDetail(productId);
});

productSearch?.addEventListener("input", (event) => {
  productFilters.query = event.target.value;
  window.TechPulseAnalytics?.track("product_filter_change", { action: "search", queryLength: productFilters.query.length });
  renderDetail(productById(new URLSearchParams(location.search).get("id"))?.id);
});

productCategory?.addEventListener("change", (event) => {
  productFilters.category = event.target.value;
  window.TechPulseAnalytics?.track("product_filter_change", { action: "category", category: productFilters.category });
  renderDetail(productById(new URLSearchParams(location.search).get("id"))?.id);
});

watchOnly?.addEventListener("change", (event) => {
  productFilters.watchOnly = event.target.checked;
  window.TechPulseAnalytics?.track("product_filter_change", { action: "watch_only", enabled: productFilters.watchOnly });
  renderDetail(productById(new URLSearchParams(location.search).get("id"))?.id);
});

productDetail.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-watch]");
  if (!button) return;
  const product = productById(button.dataset.productWatch);
  toggleWatchProduct(product);
  renderDetail(product.id);
});

const initialProductId = new URLSearchParams(location.search).get("id");
renderCategoryOptions();
renderDetail(initialProductId);
