// src/scripts/config.js
const APP_CONFIG = {
  detectionConfidenceThreshold: 70,
  analyzingDelay: 2000,
  factsGenerationDelay: 2000,
  detectionRetryInterval: 100,
};

const UI_CONFIG = {
  animationDuration: 300,
  fadeAnimation: "fadeIn 0.5s ease-out forwards",
  confidenceThresholds: {
    excellent: 90,
    good: 80,
  },
  factsCardOpacity: {
    loading: 0.6,
    normal: 1.0,
  },
};

const TENSORFLOW_CONFIG = {
  modelPath: "../model/model.json",
  metadataPath: "../model/metadata.json",
  inputSize: [224, 224],
  normalizationFactor: 255.0,
  confidenceThreshold: 70,
};

const TRANSFORMERS_CONFIG = {
  modelName: "Xenova/LaMini-Flan-T5-77M",
  max_new_tokens: 150,
  temperature: 0.3,
  top_p: 0.8,
  do_sample: true,
};

const CAMERA_CONFIG = {
  defaultFPS: 30,
  fpsRange: { min: 15, max: 60 },
  desktopResolution: { width: 640, height: 480 },
  mobileResolution: { width: 480, height: 640 },
  desktopFacingMode: "user",
  mobileFacingMode: "environment",
};

export {
  APP_CONFIG,
  UI_CONFIG,
  CAMERA_CONFIG,
  TENSORFLOW_CONFIG,
  TRANSFORMERS_CONFIG,
};
