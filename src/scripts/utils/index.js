// src/scripts/utils/index.js
import { APP_CONFIG, UI_CONFIG, CAMERA_CONFIG } from "../config.js";

export const isMobileDevice = () =>
  navigator.userAgentData?.mobile ??
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const createDelay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const sleep = (time = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

export function showFormattedDate(date, locale = "en-US", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export const isValidDetection = (result) => {
  const { detectionConfidenceThreshold } = APP_CONFIG;

  return (
    result &&
    result.isValid &&
    result.confidence >= detectionConfidenceThreshold
  );
};

export const validateModelMetadata = (metadata) =>
  metadata && metadata.labels && Array.isArray(metadata.labels);

export const getConfidenceTheme = (confidence) => {
  const { excellent, good } = UI_CONFIG.confidenceThresholds;

  if (confidence >= excellent) return "green";
  if (confidence >= good) return "yellow";

  return "red";
};

export const getConfidenceTextClass = (confidence) => {
  const theme = getConfidenceTheme(confidence);
  return `text-${theme}`;
};

export const getConfidenceCardClass = (confidence) => {
  const theme = getConfidenceTheme(confidence);
  return `theme-${theme}`;
};

export const getCameraConfig = () => {
  const mobile = isMobileDevice();

  return {
    defaultFPS: CAMERA_CONFIG.defaultFPS,
    fpsRange: CAMERA_CONFIG.fpsRange,
    resolution: mobile
      ? CAMERA_CONFIG.mobileResolution
      : CAMERA_CONFIG.desktopResolution,
    facingMode: mobile
      ? CAMERA_CONFIG.mobileFacingMode
      : CAMERA_CONFIG.desktopFacingMode,
  };
};

export const getCameraConstraints = (selectedCameraId) => {
  const config = getCameraConfig();

  return {
    video: {
      deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
      width: { ideal: config.resolution.width },
      height: { ideal: config.resolution.height },
      facingMode: config.facingMode,
      frameRate: { ideal: config.defaultFPS },
    },
  };
};

export const getCameraErrorMessage = (error) => {
  if (error.name === "NotAllowedError") {
    return "Izin kamera ditolak. Harap izinkan akses kamera.";
  }

  if (error.name === "NotFoundError") {
    return "Tidak ada kamera ditemukan pada perangkat ini.";
  }

  if (error.name === "NotReadableError") {
    return "Kamera sedang digunakan oleh aplikasi lain.";
  }

  return "Gagal memulai kamera";
};

export const addFadeInAnimation = (element) => {
  if (!element) return;

  const el = element;
  const { fadeAnimation } = UI_CONFIG;

  el.style.animation = "none";
  el.style.animation = fadeAnimation;
};

export const addScaleAnimation = (element, callback) => {
  if (!element) return;

  const el = element;
  const { animationDuration } = UI_CONFIG;

  el.style.transform = "scale(1.02)";
  el.style.transition = `transform ${animationDuration}ms ease`;

  setTimeout(() => {
    if (el) {
      el.style.transform = "scale(1)";
    }

    if (callback) {
      callback();
    }
  }, animationDuration);
};

export const hideElement = (element) => {
  if (!element) return;

  const el = element;
  el.classList.add("hidden");
};

export const showElement = (element) => {
  if (!element) return;

  const el = element;
  el.classList.remove("hidden");
};

export const setElementOpacity = (element, opacity) => {
  if (!element) return;

  const el = element;
  el.style.opacity = opacity;
};

export const setElementText = (element, text) => {
  if (!element) return;

  const el = element;
  el.textContent = text;
};

export const setElementHTML = (element, html) => {
  if (!element) return;

  const el = element;
  el.innerHTML = html;
};

export const setElementDisplay = (element, value) => {
  if (!element) return;

  const el = element;
  el.style.display = value;
};

export const setElementStyle = (element, property, value) => {
  if (!element) return;

  const el = element;
  el.style[property] = value;
};

export const logError = (context, error) => {
  console.error(`❌ ${context}:`, error);
};

export const isWebGPUSupported = () =>
  typeof navigator !== "undefined" && "gpu" in navigator;

export const createModelProgressCallback = (onProgress, throttleMs = 200) => {
  const fileProgress = {};
  let lastMessage = "";
  let lastCallTime = 0;

  return (progress) => {
    if (progress.status !== "progress" || !progress.file) return;

    const isEncoder = progress.file.includes("encoder");
    const isDecoder = progress.file.includes("decoder");

    if (!isEncoder && !isDecoder) return;

    let raw = progress.progress;

    if (raw > 1) raw /= 100;

    fileProgress[progress.file] = Math.round(raw * 100);

    const encoderFiles = Object.entries(fileProgress).filter(([file]) =>
      file.includes("encoder"),
    );

    const decoderFiles = Object.entries(fileProgress).filter(([file]) =>
      file.includes("decoder"),
    );

    const average = (entries) => {
      if (entries.length === 0) return 0;

      const sum = entries.reduce((acc, [, val]) => acc + val, 0);
      return Math.round(sum / entries.length);
    };

    const encoder = average(encoderFiles);
    const decoder = average(decoderFiles);

    const message = `Mengunduh model AI... \nEncoder: ${encoder}% | Decoder: ${decoder}%`;

    if (message === lastMessage) return;

    const now = Date.now();

    if (now - lastCallTime < throttleMs) return;

    lastCallTime = now;
    lastMessage = message;

    if (onProgress && typeof onProgress === "function") {
      onProgress({
        status: "downloading",
        encoder,
        decoder,
        message,
      });
    }
  };
};
