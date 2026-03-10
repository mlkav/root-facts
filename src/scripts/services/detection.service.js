// src/scripts/services/detection.service.js
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';
import { isWebGPUSupported, logError, validateModelMetadata } from '../utils/index.js';

class DetectionService {
  constructor() {
    this.model = null;
    this.labels = [];
    this.config = {
      modelPath: '/model/model.json',
      metadataPath: '/model/metadata.json',
      inputSize: [224, 224],
      normalizationFactor: 255.0,
      confidenceThreshold: 70,
    };
    this.performanceStats = {
      operations: 0,
      totalTime: 0,
      averageTime: 0,
    };
  }

  async loadModel(onProgress) {
    try {
      const backend = isWebGPUSupported() ? 'webgpu' : 'webgl';
      await tf.setBackend(backend);
      await tf.ready();

      if (onProgress) {
        onProgress({ status: 'loading', progress: 10, message: 'Menyiapkan backend...' });
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const metadataResponse = await fetch(this.config.metadataPath);
      if (!metadataResponse.ok) throw new Error(`Gagal memuat metadata (${metadataResponse.status})`);
      const metadata = await metadataResponse.json();

      if (!validateModelMetadata(metadata)) {
        throw new Error('Metadata tidak valid');
      }
      this.labels = metadata.labels;

      // if (onProgress) {
      //   onProgress({ status: 'loading', progress: 30, message: 'Metadata dimuat, mengunduh model...' });
      //   await new Promise(resolve => setTimeout(resolve, 200));
      // }

      this.model = await tf.loadLayersModel(this.config.modelPath);

      // if (onProgress) {
      //   onProgress({ status: 'loading', progress: 100, message: 'Model siap' });
      // }

      return {
        success: true,
        labels: this.labels,
        backend: tf.getBackend(),
      };
    } catch (error) {
      logError('Gagal memuat model deteksi', error);
      throw new Error(`Gagal memuat model deteksi: ${error.message}`);
    }
  }

  async predict(imageElement) {
    if (!this.model) throw new Error('Model belum dimuat');

    let tensor = null;
    let predictions = null;
    const startTime = performance.now();

    try {
      tensor = tf.tidy(() => {
        return tf.browser
          .fromPixels(imageElement)
          .resizeBilinear(this.config.inputSize)
          .div(this.config.normalizationFactor)
          .expandDims(0);
      });

      predictions = this.model.predict(tensor);
      const values = await predictions.data();

      const endTime = performance.now();
      const predictionTime = endTime - startTime;

      this.performanceStats.operations++;
      this.performanceStats.totalTime += predictionTime;
      this.performanceStats.averageTime = this.performanceStats.totalTime / this.performanceStats.operations;

      const maxIndex = values.indexOf(Math.max(...values));
      const confidence = Math.round(values[maxIndex] * 100);
      const className = this.labels[maxIndex] || 'Tidak diketahui';
      // console.log(`Prediksi: ${className} (${confidence}%)`);
      const isValid = confidence >= this.config.confidenceThreshold;

      return {
        className,
        confidence,
        score: values[maxIndex],
        isValid,
        allPredictions: this.labels.map((label, idx) => ({
          className: label,
          confidence: Math.round(values[idx] * 100)
        })).sort((a, b) => b.confidence - a.confidence),
        performance: {
          operationTime: Math.round(predictionTime),
          backend: tf.getBackend(),
        },
      };
    } catch (error) {
      logError('Kesalahan prediksi', error);
      throw new Error(`Prediksi gagal: ${error.message}`);
    } finally {
      if (tensor) tensor.dispose();
      if (predictions) predictions.dispose();
    }
  }

  isLoaded() {
    return !!this.model;
  }
}

export default DetectionService;