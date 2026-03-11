import {
  getCameraConstraints,
  getCameraConfig,
  getCameraErrorMessage,
  logError,
} from "../utils/index.js";

class CameraService {
  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.config = getCameraConfig();
  }

  // TODO [Basic] inisiasi elemen video dan canvas
  initializeElements(videoId, canvasId) {
    this.video = document.getElementById(videoId);
    this.canvas = document.getElementById(canvasId);
  }

  // TODO [Basic] Tambahkan konfigurasi kamera untuk mendapatkan daftar perangkat input video
  // TODO [Basic] Dapatkan constraints kamera berdasarkan konfigurasi dan kamera yang dipilih
  async loadCameras(cameraSelect) {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");

      tempStream.getTracks().forEach((track) => track.stop());

      if (cameras.length === 0) {
        logError(
          "Tidak ada kamera ditemukan",
          new Error("Tidak ada perangkat input video"),
        );
        return [];
      }

      if (cameraSelect) {
        const selectEl = cameraSelect;
        selectEl.innerHTML = "";
        cameras.forEach((camera, index) => {
          const option = document.createElement("option");
          option.value = camera.deviceId;
          option.textContent = camera.label || `Kamera ${index + 1}`;
          selectEl.appendChild(option);
        });
      }

      return cameras;
    } catch (error) {
      logError.error("Gagal memuat kamera:", error);
      throw new Error("Tidak dapat mengakses kamera. Pastikan izin diberikan.");
    }
  }

  async startCamera(videoId, canvasId, cameraSelect) {
    try {
      this.initializeElements(videoId, canvasId);
      this.stopCamera();

      const selectedDeviceId = cameraSelect ? cameraSelect.value : undefined;
      const constraints = getCameraConstraints(selectedDeviceId);

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.video) {
        this.video.srcObject = this.stream;
        await this.video.play();
      }

      return true;
    } catch (error) {
      console.error("Gagal memulai kamera:", error);
      throw new Error(getCameraErrorMessage(error));
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
  }

  setFPS(fps) {
    this.config.defaultFPS = fps;
  }

  isActive() {
    return this.stream && this.stream.active;
  }

  isReady() {
    return this.isActive() && this.video && this.video.readyState >= 2;
  }

  captureFrame() {
    if (!this.isReady() || !this.canvas) {
      return null;
    }

    const ctx = this.canvas.getContext("2d");
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    ctx.drawImage(this.video, 0, 0);
    return this.canvas;
  }
}

export default CameraService;
