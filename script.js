const WHATSAPP_NUMBER = "";
const BUSINESS_NAME = "HidroPro Exterior";
const CONTACT_FALLBACK = "contacto/index.html";

const hasWhatsApp = /^\d{10,15}$/.test(WHATSAPP_NUMBER);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const defaultMessage = [
  `Hola ${BUSINESS_NAME}, quiero pedir una cotización.`,
  "Zona:",
  "Servicio:",
  "Puedo enviar fotos o videos por acá."
].join("\n");

const whatsappUrl = (message = defaultMessage) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const contactFallbackUrl = () => {
  const depth = window.location.pathname
    .replace(/\/[^/]*$/, "/")
    .split("/")
    .filter(Boolean)
    .filter((part) => part !== "lavado-de-casas").length;

  return `${"../".repeat(depth)}${CONTACT_FALLBACK}`;
};

const campaignParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
const currentParams = new URLSearchParams(window.location.search);
const storedCampaign = JSON.parse(sessionStorage.getItem("campaign_params") || "{}");

campaignParams.forEach((key) => {
  const value = currentParams.get(key);
  if (value) storedCampaign[key] = value;
});

sessionStorage.setItem("campaign_params", JSON.stringify(storedCampaign));

const track = (eventName, details = {}) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...storedCampaign, ...details });
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, { ...storedCampaign, ...details });
  }
};

document.querySelectorAll(".js-wa").forEach((link) => {
  const linkText = link.textContent.trim().replace(/\s+/g, " ");
  const linkMessage = [
    `Hola ${BUSINESS_NAME}, quiero pedir una cotización.`,
    `Consulta: ${link.dataset.waMessage || linkText}`,
    `Página: ${document.title}`,
    "Zona:",
    "Puedo enviar fotos o videos por acá."
  ].join("\n");

  if (hasWhatsApp) {
    link.href = whatsappUrl(linkMessage);
    link.target = "_blank";
    link.rel = "noreferrer";
  } else if (link.href.includes("wa.me")) {
    link.href = contactFallbackUrl();
    link.removeAttribute("target");
    link.removeAttribute("rel");
  }

  link.addEventListener("click", () => {
    track(hasWhatsApp ? "whatsapp_click" : "contact_fallback_click", {
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

document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });
    history.pushState(null, "", hash);
  });
});

if (window.location.hash) {
  window.addEventListener("load", () => {
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    target?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });
  });
}

const animatedDetails = document.querySelectorAll("details");

animatedDetails.forEach((details) => {
  const summary = details.querySelector("summary");
  if (!summary || details.querySelector(":scope > .faq-content")) return;

  const content = document.createElement("div");
  content.className = "faq-content";

  while (summary.nextSibling) {
    content.appendChild(summary.nextSibling);
  }

  details.appendChild(content);

  const setContentHeight = () => {
    content.style.maxHeight = details.open ? `${content.scrollHeight}px` : "0px";
  };

  setContentHeight();

  details.addEventListener("toggle", () => {
    if (details.dataset.animating === "true") return;
    setContentHeight();
  });

  summary.addEventListener("click", (event) => {
    if (reduceMotion) return;
    event.preventDefault();
    if (details.dataset.animating === "true") return;

    details.dataset.animating = "true";

    const finish = (callback) => {
      let done = false;
      const complete = (transitionEvent) => {
        if (transitionEvent && transitionEvent.target !== content) return;
        if (done) return;
        done = true;
        content.removeEventListener("transitionend", complete);
        window.clearTimeout(timer);
        callback();
      };
      const timer = window.setTimeout(complete, 340);
      content.addEventListener("transitionend", complete);
    };

    if (details.open) {
      details.classList.add("is-closing");
      content.style.maxHeight = `${content.scrollHeight}px`;
      content.offsetHeight;
      content.style.maxHeight = "0px";

      finish(() => {
        details.open = false;
        details.classList.remove("is-closing");
        details.dataset.animating = "false";
      });
      return;
    }

    details.open = true;
    details.classList.remove("is-closing");
    content.style.maxHeight = "0px";
    content.offsetHeight;
    content.style.maxHeight = `${content.scrollHeight}px`;

    finish(() => {
      details.dataset.animating = "false";
      setContentHeight();
    });
  });
});

window.addEventListener(
  "resize",
  () => {
    animatedDetails.forEach((details) => {
      const content = details.querySelector(":scope > .faq-content");
      if (content && details.open) {
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    });
  },
  { passive: true }
);

const featureVideos = document.querySelectorAll(".work-feature video");
const hoverVideos = document.querySelectorAll(".video-grid video");
const trackedVideoAutoplays = new WeakSet();

[...featureVideos, ...hoverVideos].forEach((video) => {
  video.muted = true;
  video.playsInline = true;
});

if (reduceMotion) {
  [...featureVideos, ...hoverVideos].forEach((video) => {
    video.controls = true;
  });
} else {
  hoverVideos.forEach((video) => {
    const play = () => video.play().catch(() => {});
    const pause = () => {
      video.pause();
      video.currentTime = 0;
    };

    video.addEventListener("mouseenter", play);
    video.addEventListener("focus", play);
    video.addEventListener("mouseleave", pause);
    video.addEventListener("blur", pause);
  });
}

if (!reduceMotion && "IntersectionObserver" in window && featureVideos.length) {
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

  featureVideos.forEach((video) => videoObserver.observe(video));
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

  track("quote_form_submit", {
    service,
    zone,
    page_path: window.location.pathname
  });

  if (hasWhatsApp) {
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  } else {
    window.location.href = contactFallbackUrl();
  }
});
