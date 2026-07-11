(function loadTechPulseProducts() {
  const params = new URLSearchParams(location.search);
  const requested = params.get("source");
  const source = requested === "demo" || requested === "generated" ? requested : window.TechPulseDataSource || "generated";
  const file = source === "generated" ? "product-data.generated.js" : "product-data.js";
  document.write(`<script src="./${file}"><\\/script>`);
})();
