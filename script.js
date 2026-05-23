// Pulse Football Landing
// Edit these values when the store links or GA4 Measurement ID change.

const CONFIG = {
  iosUrl: "https://apps.apple.com/ar/app/pulse-football/id6748041027?l=en-GB",
  androidUrl: "https://play.google.com/apps/testing/com.diegotubito.pulsefootball",

  // Replace with your GA4 Measurement ID, for example: "G-ABC123XYZ9".
  // Leave empty until GA4 is created.
  gaMeasurementId: "",

  // Delay before redirecting mobile users.
  redirectDelayMs: 1200,
};

const COPY = {
  es: {
    eyebrow: "Pulse Football",
    headline: "Predicciones, rankings<br>y partidos<br>en una sola app.",
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
    headline: "Predictions, rankings<br>and matches<br>in one app.",
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

function getLanguage() {
  const params = new URLSearchParams(window.location.search);
  const forcedLanguage = params.get("lang");

  if (forcedLanguage === "en" || forcedLanguage === "es") {
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
}

function setupStoreLinks() {
  const iosButton = document.getElementById("ios-button");
  const androidButton = document.getElementById("android-button");

  iosButton.href = CONFIG.iosUrl;
  androidButton.href = CONFIG.androidUrl;

  iosButton.addEventListener("click", () => trackEvent("click_ios"));
  androidButton.addEventListener("click", () => trackEvent("click_android"));
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

function handleRedirect(language) {
  const device = getDevice();

  if (shouldSkipRedirect()) {
    updateStatus("noRedirect", language);
    return;
  }

  if (device === "ios") {
    updateStatus("redirectIOS", language);
    trackEvent("auto_redirect_ios");

    window.setTimeout(() => {
      window.location.href = CONFIG.iosUrl;
    }, CONFIG.redirectDelayMs);

    return;
  }

  if (device === "android") {
    updateStatus("redirectAndroid", language);
    trackEvent("auto_redirect_android");

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
  setupStoreLinks();
  handleRedirect(language);
})();
