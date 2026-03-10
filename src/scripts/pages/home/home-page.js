// src/scripts/pages/home/home-page.js
import {
  generateCameraSection,
  generateInfoPanel,
  generateFooter,
} from "../../templates.js";
import HomePresenter from "./home-presenter.js";
import {
  setElementText,
  setElementDisplay,
  addFadeInAnimation,
  setElementStyle,
  logError
} from '../../utils/index.js';

export default class HomePage {
  #presenter = null;

  async render() {
    return `
      <main class="main-content">
        ${generateCameraSection()}
        ${generateInfoPanel()}
      </main>
      ${generateFooter()}
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({ view: this });
    await this.#presenter.init();
    this.#bindEvents();
  }

  #bindEvents() {
    const toggleBtn = document.getElementById('btn-toggle');
    const fpsSlider = document.getElementById('fps-slider');
    const fpsLabel = document.getElementById('fps-label');
    const toneSelect = document.getElementById('tone-select');
    const copyBtn = document.getElementById('btn-copy');

    toggleBtn?.addEventListener('click', () => this.#presenter.toggleCamera());

    if (fpsSlider) {
      fpsSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        if (fpsLabel) fpsLabel.textContent = val + ' FPS';
        this.#presenter.setFPS(parseInt(val, 10));
      });
    }

    toneSelect?.addEventListener('change', (e) => {
      this.#presenter.setTone(e.target.value);
    });

    copyBtn?.addEventListener('click', () => {
      const factText = document.getElementById('fun-fact-text')?.textContent;
      if (factText) this.#presenter.copyFactToClipboard(factText);
    });

    window.addEventListener('beforeunload', () => {
      this.#presenter.stopCamera();
    });
  }

  // ========== METODE VIEW ==========
  updateHeaderStatus(message, type) {
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');
    if (statusText) statusText.textContent = message;
    if (statusDot) {
      statusDot.className = 'status-dot ' + (type || '');
    }
  }

  showLoadingProgress(percent, message) {
    const statusText = document.getElementById('status-text');
    if (statusText) {
      if (message.includes('%')) {
        statusText.textContent = message;
      } else {
        statusText.textContent = `${message} (${percent}%)`;
      }
    }
  }

  enableToggleButton() {
    const btn = document.getElementById('btn-toggle');
    if (btn) btn.disabled = false;
  }

  getCameraSelect() {
    return document.getElementById('camera-select');
  }

  showCameraActive() {
    // console.log('showCameraActive');
    const placeholder = document.getElementById('camera-placeholder');
    const video = document.getElementById('media-video');
    const overlay = document.getElementById('camera-overlay');
    if (placeholder) setElementDisplay(placeholder, 'none');
    if (video) {
      setElementDisplay(video, 'block');
      video.play().catch(e => logError('Video play error', e));
    }
    if (overlay) setElementDisplay(overlay, 'block');
  }

  showCameraInactive() {
    // console.log('showCameraInactive');
    const placeholder = document.getElementById('camera-placeholder');
    const video = document.getElementById('media-video');
    const overlay = document.getElementById('camera-overlay');
    if (placeholder) setElementDisplay(placeholder, 'flex');
    if (video) {
      video.pause();
      setElementDisplay(video, 'none');
    }
    if (overlay) setElementDisplay(overlay, 'none');
  }

  showIdleState() {
    // console.log('showIdleState');
    setElementDisplay(document.getElementById('state-idle'), 'block');
    setElementDisplay(document.getElementById('state-loading'), 'none');
    setElementDisplay(document.getElementById('state-result'), 'none');
    document.getElementById('state-idle')?.classList.remove('hidden');
    document.getElementById('state-loading')?.classList.add('hidden');
    document.getElementById('state-result')?.classList.add('hidden');
  }

  showLoadingState() {
    // console.log('showLoadingState');
    setElementDisplay(document.getElementById('state-idle'), 'none');
    setElementDisplay(document.getElementById('state-loading'), 'block');
    setElementDisplay(document.getElementById('state-result'), 'none');
    document.getElementById('state-idle')?.classList.add('hidden');
    document.getElementById('state-loading')?.classList.remove('hidden');
    document.getElementById('state-result')?.classList.add('hidden');
  }

  showAnalyzingState() {
    this.showLoadingState();
  }

  showResultState(className, confidence) {
    // console.log('showResultState', className, confidence);
    const stateIdle = document.getElementById('state-idle');
    const stateLoading = document.getElementById('state-loading');
    const stateResult = document.getElementById('state-result');

    if (stateIdle) setElementDisplay(stateIdle, 'none');
    if (stateLoading) setElementDisplay(stateLoading, 'none');
    if (stateResult) {
      setElementDisplay(stateResult, 'block');
      stateResult.classList.remove('hidden');
      addFadeInAnimation(stateResult);
    }

    const nameEl = document.getElementById('detected-name');
    const confEl = document.getElementById('detected-confidence');
    const fillEl = document.getElementById('confidence-fill');

    if (nameEl) setElementText(nameEl, className);
    if (confEl) setElementText(confEl, confidence + '%');
    if (fillEl) setElementStyle(fillEl, 'width', confidence + '%');
  }

  showFactLoading() {
    // console.log('showFactLoading');
    const factLoading = document.getElementById('fun-fact-loading');
    const factContent = document.getElementById('fun-fact-content');
    if (factLoading) {
      factLoading.classList.remove('hidden');
      setElementDisplay(factLoading, 'flex');
    }
    if (factContent) {
      factContent.classList.add('hidden');
      setElementDisplay(factContent, 'none');
    }
  }

  showFact(fact) {
    // console.log('showFact', fact);
    const factLoading = document.getElementById('fun-fact-loading');
    const factContent = document.getElementById('fun-fact-content');
    const factText = document.getElementById('fun-fact-text');
    if (factLoading) {
      factLoading.classList.add('hidden');
      setElementDisplay(factLoading, 'none');
    }
    if (factContent) {
      factContent.classList.remove('hidden');
      setElementDisplay(factContent, 'block');
    }
    if (factText) setElementText(factText, fact);
  }

  showFactError(message = 'Gagal memuat fakta. Coba lagi.') {
    // console.log('showFactError', message);
    const factLoading = document.getElementById('fun-fact-loading');
    const factContent = document.getElementById('fun-fact-content');
    const factText = document.getElementById('fun-fact-text');
    if (factLoading) {
      factLoading.classList.add('hidden');
      setElementDisplay(factLoading, 'none');
    }
    if (factContent) {
      factContent.classList.remove('hidden');
      setElementDisplay(factContent, 'block');
    }
    if (factText) setElementText(factText, message);
  }

  showCopySuccess() {
    alert('Fakta disalin!');
  }

  showCopyError() {
    alert('Gagal menyalin.');
  }

  showError(message) {
    alert(message);
  }
}
