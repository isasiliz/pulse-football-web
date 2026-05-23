// Pulse Football Landing
// Edit these values when the store links or GA4 Measurement ID change.

const CONFIG = {
  iosUrl: "https://apps.apple.com/ar/app/pulse-football/id6748041027?l=en-GB",
  androidUrl: "https://play.google.com/apps/testing/com.diegotubito.pulsefootball",

  // Replace with your GA4 Measurement ID, for example: "G-ABC123XYZ9".
  // Leave empty until GA4 is created.
  gaMeasurementId: "G-NME3JTTJEC",

  // Delay before redirecting mobile users.
  redirectDelayMs: 1200,
};

const COPY = {
  es: {
    eyebrow: "Pulse Football",
    headline: "Predicciones, rankings<br>y partidos en<br>una sola app.",
    subtitle:
      "Viví el Mundial de otra manera: seguí cada partido, hacé tus predicciones, competí con amigos y subí en el ranking.",
    pillLive: "Partidos en vivo",
    pillPredictions: "Predicciones",
    pillStats: "Estadísticas",
    pillRanking: "Ranking",
    redirecting: "Detectando tu dispositivo...",
    redirectIOS: "Abriendo App Store...",
    redirectAndroid: "Abriendo Google Play...",
    noRedirect: "Elegí tu tienda para descargar la app.",
    downloadOn: "Descargar en",
    fallback: "Si no se abre automáticamente, elegí tu tienda.",
    privacy: "Política de privacidad",
  },
  en: {
    eyebrow: "Pulse Football",
    headline: "Predictions, rankings<br>and matches in<br>one app.",
    subtitle:
      "Experience the World Cup differently: follow every match, make your predictions, compete with friends, and climb the ranking.",
    pillLive: "Live matches",
    pillPredictions: "Predictions",
    pillStats: "Stats",
    pillRanking: "Ranking",
    redirecting: "Detecting your device...",
    redirectIOS: "Opening the App Store...",
    redirectAndroid: "Opening Google Play...",
    noRedirect: "Choose your store to download the app.",
    downloadOn: "Download on",
    fallback: "If it does not open automatically, choose your store.",
    privacy: "Privacy Policy",
  },
};

function isSupportedLanguage(language) {
  return Object.prototype.hasOwnProperty.call(COPY, language);
}

function getLanguage() {
  const params = new URLSearchParams(window.location.search);
  const forcedLanguage = params.get("lang");
  const savedLanguage = localStorage.getItem("pulse-language");

  if (isSupportedLanguage(savedLanguage)) {
    return savedLanguage;
  }

  if (isSupportedLanguage(forcedLanguage)) {
    return forcedLanguage;
  }

  const browserLanguage = (navigator.language || "es").toLowerCase();
  return browserLanguage.startsWith("en") ? "en" : "es";
}

function applyCopy(language) {
  const dictionary = COPY[language] || COPY.es;
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (dictionary[key]) {
      element.innerHTML = dictionary[key];
    }
  });

  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.langOption === language);
  });
}

function setupLanguageSwitch(currentLanguage) {
  document.querySelectorAll("[data-lang-option]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.langOption === currentLanguage);

    button.addEventListener("click", () => {
      const selectedLanguage = button.dataset.langOption;

      if (!isSupportedLanguage(selectedLanguage)) return;

      localStorage.setItem("pulse-language", selectedLanguage);
      applyCopy(selectedLanguage);
      updateStatus("noRedirect", selectedLanguage);
      trackEvent("change_language", { language: selectedLanguage });
    });
  });
}

function setupStoreLinks() {
  const iosButton = document.getElementById("ios-button");
  const androidButton = document.getElementById("android-button");

  iosButton.href = CONFIG.iosUrl;
  androidButton.href = CONFIG.androidUrl;

  iosButton.addEventListener("click", () => trackEvent("click_ios", getTrackingParams()));
  androidButton.addEventListener("click", () => trackEvent("click_android", getTrackingParams()));
}

function setupAnalytics() {
  if (!CONFIG.gaMeasurementId) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.gaMeasurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", CONFIG.gaMeasurementId, {
    send_page_view: true,
  });
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag !== "function") return;

  window.gtag("event", name, {
    app_name: "pulse_football",
    ...params,
  });
}

function getDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || "";

  if (/android/i.test(userAgent)) return "android";
  if (/iPad|iPhone|iPod/.test(userAgent)) return "ios";

  const isModernIPad =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;

  if (isModernIPad) return "ios";

  return "unknown";
}

function shouldSkipRedirect() {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") === "0";
}

function updateStatus(messageKey, language) {
  const status = document.getElementById("redirect-status");
  const dictionary = COPY[language] || COPY.es;
  status.textContent = dictionary[messageKey] || dictionary.noRedirect;
}

function getTrackingParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get("source") || params.get("utm_source") || "direct",
    medium: params.get("medium") || params.get("utm_medium") || "none",
    campaign: params.get("campaign") || params.get("utm_campaign") || "none",
  };
}

function trackLandingSource() {
  const trackingParams = getTrackingParams();

  trackEvent("landing_source_detected", trackingParams);
}

function shouldTrackRedirect(device) {
  const key = `pulse-last-auto-redirect-${device}`;
  const now = Date.now();
  const lastRedirect = Number(sessionStorage.getItem(key) || 0);
  const redirectCooldownMs = 15000;

  if (now - lastRedirect < redirectCooldownMs) {
    return false;
  }

  sessionStorage.setItem(key, String(now));
  return true;
}

function handleRedirect(language) {
  const device = getDevice();

  if (shouldSkipRedirect()) {
    updateStatus("noRedirect", language);
    return;
  }

  if (device === "ios") {
    updateStatus("redirectIOS", language);
    if (shouldTrackRedirect("ios")) {
      trackEvent("auto_redirect_ios", getTrackingParams());
    }

    window.setTimeout(() => {
      window.location.href = CONFIG.iosUrl;
    }, CONFIG.redirectDelayMs);

    return;
  }

  if (device === "android") {
    updateStatus("redirectAndroid", language);
    if (shouldTrackRedirect("android")) {
      trackEvent("auto_redirect_android", getTrackingParams());
    }

    window.setTimeout(() => {
      window.location.href = CONFIG.androidUrl;
    }, CONFIG.redirectDelayMs);

    return;
  }

  updateStatus("noRedirect", language);
}

(function init() {
  const language = getLanguage();

  setupAnalytics();
  applyCopy(language);
  setupLanguageSwitch(language);
  setupStoreLinks();
  trackLandingSource();
  handleRedirect(language);
})();
