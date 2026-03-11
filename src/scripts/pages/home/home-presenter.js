// src/scripts/pages/home/home-presenter.js
import CameraService from "../../services/camera.service.js";
import DetectionService from "../../services/detection.service.js";
import RootFactsService from "../../services/rootfacts.service.js";
import { createDelay, isValidDetection } from "../../utils/index.js";
import { APP_CONFIG } from "../../config.js";

export default class HomePresenter {
  constructor({ view }) {
    this.view = view;
    this.cameraService = new CameraService();
    this.detectionService = new DetectionService();
    this.factsService = new RootFactsService();
    this.detectionLoopId = null;
    this.detectionTimer = null;
    this.currentFPS = 30;
  }

  async init() {
    this.view.updateHeaderStatus("Memuat model...", "loading");
    this.view.showLoadingProgress(0, "Menyiapkan...");

    try {
      await this.cameraService.loadCameras(this.view.getCameraSelect());

      this.view.updateHeaderStatus("Model deteksi...", "loading");
      await this.detectionService.loadModel((progress) => {
        if (progress.status === "loading") {
          this.view.showLoadingProgress(progress.progress, progress.message);
        }
      });

      this.view.updateHeaderStatus("Model fakta...", "loading");
      await this.factsService.loadModel((progress) => {
        if (progress.status === "loading") {
          this.view.showLoadingProgress(progress.progress, progress.message);
        } else if (progress.status === "downloading") {
          this.view.updateHeaderStatus(progress.message, "");
          const avgProgress = Math.round(
            (progress.encoder + progress.decoder) / 2,
          );
          this.view.showLoadingProgress(avgProgress, progress.message);
        } else if (progress.status === "ready") {
          this.view.updateHeaderStatus("Model AI siap", "active");
          this.view.showLoadingProgress(100, "Siap!");
        }
      });

      this.view.enableToggleButton();
    } catch (error) {
      console.error("Init error:", error);
      this.view.updateHeaderStatus("Gagal", "error");
      this.view.showError(`Gagal memuat model: ${error.message}`);
    }
  }

  async toggleCamera() {
    if (this.cameraService.isActive()) {
      this.stopCamera();
    } else {
      await this.startCamera();
    }
  }

  async startCamera() {
    try {
      await this.cameraService.startCamera(
        "media-video",
        "media-canvas",
        this.view.getCameraSelect(),
      );
      this.view.showCameraActive();
      this.view.showLoadingState();
      this.startDetectionLoop();
    } catch (error) {
      this.view.showError(`Gagal memulai kamera: ${error.message}`);
    }
  }

  stopCamera() {
    this.stopDetectionLoop();
    this.cameraService.stopCamera();
    this.view.showCameraInactive();
    this.view.showIdleState();
  }

  setFPS(fps) {
    this.currentFPS = fps;
    this.cameraService.setFPS(fps);
    if (this.cameraService.isActive()) {
      this.startDetectionLoop();
    }
  }

  setTone(tone) {
    this.factsService.setTone(tone);
  }

  startDetectionLoop() {
    this.stopDetectionLoop();
    const interval = 1000 / this.currentFPS;
    const loopId = Date.now();
    this.detectionLoopId = loopId;

    const runDetection = async () => {
      if (!this.cameraService.isActive() || this.detectionLoopId !== loopId) {
        return;
      }

      const canvas = this.cameraService.captureFrame();
      if (!canvas) {
        return;
      }

      try {
        const result = await this.detectionService.predict(canvas);
        if (isValidDetection(result)) {
          this.stopDetectionLoop();
          this.view.showAnalyzingState();
          await createDelay(APP_CONFIG.analyzingDelay);
          this.stopCamera();
          this.view.showResultState(result.className, result.confidence);
          // console.log('showResultState', result.className, result.confidence);
          this.generateFact(result.className);
        }
      } catch (error) {
        console.error("Detection error:", error);
      }
    };

    runDetection();
    this.detectionTimer = setInterval(runDetection, interval);
  }

  stopDetectionLoop() {
    if (this.detectionTimer) {
      clearInterval(this.detectionTimer);
      this.detectionTimer = null;
    }
    this.detectionLoopId = null;
  }

  async generateFact(vegetable) {
    this.view.showFactLoading();
    try {
      if (!this.factsService.isReady()) {
        this.view.showFactError("Model fakta masih diunduh, coba lagi nanti.");
        return;
      }
      const fact = await this.factsService.generateFacts(vegetable);
      this.view.showFact(fact);
    } catch (error) {
      console.error("Generate fact error:", error);
      this.view.showFactError(error.message || "Gagal memuat fakta.");
    }
  }

  async copyFactToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.view.showCopySuccess();
    } catch (err) {
      this.view.showCopyError();
    }
  }
}
