// src/scripts/services/rootfacts.service.js
import { pipeline } from '@huggingface/transformers';
import { isWebGPUSupported, logError, createDelay, createModelProgressCallback } from '../utils/index.js';
import { APP_CONFIG } from '../config.js';

class RootFactsService {
  constructor() {
    this.generator = null;
    this.isModelLoaded = false;
    this.isGenerating = false;
    this.currentBackend = null;
    this.currentTone = 'normal';
    this.config = {
      modelName: 'Xenova/LaMini-Flan-T5-77M',
      maxTokens: 80,
      temperature: 0.3,
      topP: 0.8,
      do_sample: true,
    };
  }

  async loadModel(onProgress) {
    try {
      const device = isWebGPUSupported() ? 'webgpu' : 'wasm';
      this.currentBackend = device;

      if (onProgress) {
        onProgress({ status: 'loading', progress: 10, message: 'Menyiapkan pipeline AI...' });
      }

      this.generator = await pipeline('text2text-generation', this.config.modelName, {
        dtype: 'q4',
        device,
        progress_callback: onProgress ? createModelProgressCallback(onProgress) : undefined,
      });

      // Set model loaded segera setelah pipeline selesai
      this.isModelLoaded = true;

      // Opsional: tetap beri delay untuk efek visual, tapi sekarang setelah model siap
      await createDelay(APP_CONFIG.factsGenerationDelay);

      if (onProgress) {
        onProgress({ status: 'ready', progress: 100, message: 'Model AI siap' });
      }

      return {
        success: true,
        model: this.config.modelName,
        backend: this.currentBackend,
      };
    } catch (error) {
      logError('Gagal memuat model fakta', error);
      throw new Error(`Gagal memuat model fakta: ${error.message}`);
    }
  }

  setTone(tone) {
    this.currentTone = tone;
  }

  async generateFacts(vegetable, tone = null) {
    // Periksa apakah model siap
    if (!this.isModelLoaded) {
      throw new Error('Model fakta belum siap. Silakan tunggu beberapa saat.');
    }
    if (this.isGenerating) {
      throw new Error('Model sedang memproses permintaan lain.');
    }

    const sanitized = vegetable.replace(/[^a-zA-Z\s]/g, '').trim();
    if (!sanitized) {
      throw new Error('Nama sayuran tidak valid');
    }

    const activeTone = tone || this.currentTone;

    let prompt;
    switch (activeTone) {
      case 'funny':
        prompt = `Tell me a funny and amusing fact about ${sanitized} in one or two sentences.`;
        break;
      case 'professional':
        prompt = `Provide a professional, scientific fact about ${sanitized} in one or two sentences.`;
        break;
      case 'casual':
        prompt = `Give me a casual, interesting fact about ${sanitized} in one or two sentences.`;
        break;
      default:
        prompt = `Give me an interesting fact about ${sanitized} in one or two sentences.`;
    }

    try {
      this.isGenerating = true;
      console.log('Generating fact with prompt:', prompt);

      const result = await this.generator(prompt, {
        max_new_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        do_sample: this.config.do_sample,
      });

      const generatedText = result[0].generated_text;
      return generatedText.trim();
    } catch (error) {
      logError('Gagal generate fakta', error);
      throw new Error('Gagal menghasilkan fakta');
    } finally {
      this.isGenerating = false;
    }
  }

  isReady() {
    return this.isModelLoaded && !this.isGenerating;
  }
}

export default RootFactsService;