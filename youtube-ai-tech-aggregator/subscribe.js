const { videos } = window.TechPulseData;
const { scoreVideo, formatNumber } = window.TechPulseUtils;

const form = document.querySelector("#subscriptionForm");
const preview = document.querySelector("#digestPreview");
const notice = document.querySelector("#subscriptionNotice");
const deliveryChannel = document.querySelector("#deliveryChannel");
const keywordInput = document.querySelector("#keywordInput");
const digestTime = document.querySelector("#digestTime");

function renderPreview() {
  const topVideos = [...videos]
    .map((video) => ({ ...video, score: scoreVideo(video) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  preview.innerHTML = topVideos
    .map(
      (video, index) => `
        <article>
          <b>${String(index + 1).padStart(2, "0")}</b>
          <div>
            <strong>${video.topic}</strong>
            <p>${video.channel} · Score ${formatNumber(video.score)}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function loadPreferences() {
  const saved = JSON.parse(localStorage.getItem("techpulse-subscription") || "null");
  if (!saved) return;
  deliveryChannel.value = saved.deliveryChannel;
  keywordInput.value = saved.keywords;
  digestTime.value = saved.digestTime;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!window.TechPulseAuth.isRegistered()) {
    notice.innerHTML = `保存订阅需要注册。<a href="${window.TechPulseAuth.authUrl("subscription")}">免费注册后继续</a>`;
    return;
  }
  localStorage.setItem(
    "techpulse-subscription",
    JSON.stringify({
      deliveryChannel: deliveryChannel.value,
      keywords: keywordInput.value,
      digestTime: digestTime.value,
    })
  );
  notice.textContent = "订阅偏好已保存，可在“我的账户”查看。";
});

loadPreferences();
renderPreview();
