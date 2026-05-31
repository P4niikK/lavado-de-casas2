const WHATSAPP_NUMBER = "";
const BUSINESS_NAME = "Lavado de Casas";
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

/* ---- Hero "lavado": el puntero borra la casa sucia y revela la limpia ---- */
const initHeroWash = () => {
  const hero = document.querySelector(".hero");
  const canvas = hero?.querySelector("[data-hero-wash]");
  if (!hero || !canvas) return;

  // Sin movimiento: dejamos visible solo la casa limpia.
  if (reduceMotion) {
    canvas.remove();
    hero.querySelector("[data-hero-hint]")?.remove();
    return;
  }

  const ctx = canvas.getContext("2d");
  const hint = hero.querySelector("[data-hero-hint]");
  let width = 0;
  let height = 0;
  let dpr = 1;
  let dirtyImg = null;
  let useGrime = false;
  let ready = false;
  let last = null;

  // Cursor/ícono de hidrolavadora con chorro animado.
  const washer = document.createElement("div");
  washer.className = "hero-washer";
  washer.setAttribute("aria-hidden", "true");
  washer.innerHTML = `
    <svg viewBox="0 0 96 96" width="96" height="96" fill="none">
      <g class="hw-jet" stroke="#8fd8ff" stroke-width="3" stroke-linecap="round">
        <path d="M16 16 L2 9" />
        <path d="M16 16 L1 17" />
        <path d="M16 16 L9 2" />
      </g>
      <g class="hw-drops" fill="#bfe6ff">
        <circle cx="6" cy="6" r="1.6" />
        <circle cx="3" cy="13" r="1.3" />
        <circle cx="12" cy="3" r="1.3" />
      </g>
      <rect x="14" y="22" width="42" height="8" rx="4" transform="rotate(45 14 22)" fill="#16202b" />
      <circle cx="16" cy="16" r="4.5" fill="#cdebff" stroke="#16202b" stroke-width="2" />
      <rect x="50" y="46" width="14" height="32" rx="7" transform="rotate(28 50 46)" fill="#1f6f3a" />
      <rect x="42" y="40" width="24" height="12" rx="6" transform="rotate(45 42 40)" fill="#27a046" />
    </svg>`;
  hero.appendChild(washer);
  hero.classList.add("is-washable");

  const addStains = () => {
    // Manchas verdosas/marrones para que el modo "fallback" se note sucio.
    const blobs = 26;
    for (let i = 0; i < blobs; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = 20 + Math.random() * 70;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const green = Math.random() > 0.5;
      g.addColorStop(0, green ? "rgba(60, 78, 34, 0.5)" : "rgba(72, 55, 33, 0.5)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawDirty = () => {
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, width, height);
    if (!dirtyImg) return;

    // Escala "cover".
    const ir = dirtyImg.naturalWidth / dirtyImg.naturalHeight;
    const cr = width / height;
    let dw;
    let dh;
    if (ir > cr) {
      dh = height;
      dw = height * ir;
    } else {
      dw = width;
      dh = width / ir;
    }
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;

    ctx.filter = useGrime ? "grayscale(0.6) brightness(0.78) sepia(0.32) contrast(1.05)" : "none";
    ctx.drawImage(dirtyImg, dx, dy, dw, dh);
    ctx.filter = "none";
    if (useGrime) addStains();
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (ready) drawDirty();
  };

  const erase = (x, y) => {
    const r = 48;
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(0, 0, 0, 1)");
    g.addColorStop(0.55, "rgba(0, 0, 0, 0.92)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  const moveTo = (clientX, clientY) => {
    const rect = hero.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    washer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    hero.classList.add("is-active");
    hint?.classList.add("is-hidden");

    if (!ready) {
      last = { x, y };
      return;
    }

    if (last) {
      const dx = x - last.x;
      const dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(dist / 12));
      for (let i = 1; i <= steps; i++) {
        erase(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
      }
    } else {
      erase(x, y);
    }
    last = { x, y };
  };

  hero.addEventListener("mousemove", (event) => moveTo(event.clientX, event.clientY));
  hero.addEventListener("mouseleave", () => {
    hero.classList.remove("is-active");
    last = null;
  });
  hero.addEventListener(
    "touchstart",
    (event) => {
      const t = event.touches[0];
      if (!t) return;
      last = null;
      moveTo(t.clientX, t.clientY);
    },
    { passive: true }
  );
  hero.addEventListener(
    "touchmove",
    (event) => {
      const t = event.touches[0];
      if (t) moveTo(t.clientX, t.clientY);
    },
    { passive: true }
  );
  hero.addEventListener(
    "touchend",
    () => {
      hero.classList.remove("is-active");
      last = null;
    },
    { passive: true }
  );

  window.addEventListener("resize", resize, { passive: true });

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      if (!src) {
        reject();
        return;
      }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  resize(); // dimensiona el canvas mientras carga la imagen

  loadImage(canvas.dataset.dirtySrc)
    .then((img) => {
      dirtyImg = img;
    })
    .catch(() =>
      loadImage(canvas.dataset.dirtyFallback).then((img) => {
        dirtyImg = img;
        useGrime = true; // no hay foto sucia real: simulamos mugre con filtro + manchas
      })
    )
    .catch(() => {})
    .finally(() => {
      ready = true;
      resize();
    });
};

initHeroWash();

/* ---- Mapa interactivo de zonas: elevar la pieza y mostrar el nombre ---- */
const initZonaMaps = () => {
  document.querySelectorAll(".zona-map").forEach((svg) => {
    const group = svg.querySelector(".zona-regions");
    const regions = svg.querySelectorAll(".zona-region");

    const clearActive = () =>
      regions.forEach((r) => r.classList.remove("is-active"));

    regions.forEach((region) => {
      const raise = () => {
        group.appendChild(region); // se dibuja al final = queda arriba de las vecinas
        region.classList.add("is-active");
      };
      const lower = () => region.classList.remove("is-active");

      region.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "touch") raise();
      });
      region.addEventListener("pointerleave", (event) => {
        if (event.pointerType !== "touch") lower();
      });
      region.addEventListener("focus", raise);
      region.addEventListener("blur", lower);

      // Tap en mobile: alterna esta zona y apaga el resto.
      region.addEventListener("click", () => {
        const wasActive = region.classList.contains("is-active");
        clearActive();
        if (!wasActive) raise();
      });
      region.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          region.classList.toggle("is-active");
          if (region.classList.contains("is-active")) group.appendChild(region);
        }
      });
    });
  });
};

initZonaMaps();
