(function loadTechPulseProducts() {
  const params = new URLSearchParams(location.search);
  const requested = params.get("source");
  const source = requested === "demo" || requested === "generated" ? requested : window.TechPulseDataSource || "generated";
  const file = source === "generated" ? "product-data.generated.js" : "product-data.js";
  const cacheKey = source === "generated" ? Math.floor(Date.now() / 300000) : "demo";
  document.write(`<script src="./${file}?v=${cacheKey}"><\\/script>`);
})();
