const productState = window.TechPulseProducts || { products: [] };
const productVideos = window.TechPulseData?.videos || [];
const productDirectory = document.querySelector("#productDirectory");
const productDetail = document.querySelector("#productDetail");

function productById(id) {
  return productState.products.find((product) => product.id === id) || productState.products[0];
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
  productDirectory.innerHTML = `
    <span class="section-label">Today's Signal Radar</span>
    ${productState.products
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
      .join("")}
  `;
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
  const product = productById(productId);
  if (!product) return;
  const videos = relatedVideos(product);
  renderDirectory(product.id);

  productDetail.innerHTML = `
    <div class="product-detail-head">
      <div>
        <span class="section-label">${product.category}</span>
        <h2>${product.name}</h2>
        <p>${product.tagline}</p>
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

const initialProductId = new URLSearchParams(location.search).get("id");
renderDetail(initialProductId);
