const WHATSAPP_NUMBER = "5491100000000";
const BUSINESS_NAME = "HidroPro Exterior";

const defaultMessage = [
  `Hola ${BUSINESS_NAME}, quiero pedir una cotización.`,
  "Zona:",
  "Servicio:",
  "Puedo enviar fotos o videos por acá."
].join("\n");

const whatsappUrl = (message = defaultMessage) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const track = (eventName, details = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...details });
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, details);
  }
};

document.querySelectorAll(".js-wa").forEach((link) => {
  link.href = whatsappUrl();
  link.addEventListener("click", () => {
    track("whatsapp_click", {
      link_text: link.textContent.trim(),
      page_path: window.location.pathname
    });
  });
});

const header = document.querySelector("[data-header]");
const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

const previewVideos = document.querySelectorAll(".work-feature video, .video-grid video");
const trackedVideoAutoplays = new WeakSet();

previewVideos.forEach((video) => {
  video.muted = true;
  video.playsInline = true;

  const play = () => video.play().catch(() => {});
  const pause = () => video.pause();

  video.addEventListener("mouseenter", play);
  video.addEventListener("focus", play);
  video.addEventListener("mouseleave", pause);
  video.addEventListener("blur", pause);
});

if ("IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
          video.play().catch(() => {});
          if (!trackedVideoAutoplays.has(video)) {
            track("video_autoplay_in_view", {
              page_path: window.location.pathname,
              video_src: video.currentSrc || video.querySelector("source")?.src || ""
            });
            trackedVideoAutoplays.add(video);
          }
        } else {
          video.pause();
        }
      });
    },
    {
      threshold: 0.45,
      rootMargin: "0px 0px -12% 0px"
    }
  );

  previewVideos.forEach((video) => videoObserver.observe(video));
}

const form = document.querySelector("[data-estimate-form]");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("name")?.toString().trim();
  const zone = data.get("zone")?.toString().trim();
  const service = data.get("service")?.toString().trim();
  const details = data.get("details")?.toString().trim();

  const message = [
    `Hola ${BUSINESS_NAME}, quiero pedir una cotización.`,
    name ? `Nombre: ${name}` : "",
    zone ? `Zona: ${zone}` : "",
    service ? `Servicio: ${service}` : "",
    details ? `Detalle: ${details}` : "",
    "Puedo enviar fotos o videos por WhatsApp."
  ]
    .filter(Boolean)
    .join("\n");

  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  track("quote_form_submit", {
    service,
    zone,
    page_path: window.location.pathname
  });
});
