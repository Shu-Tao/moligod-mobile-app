/**
 * Moligod 移动端应用主脚本
 * 负责 WebView 加载、状态管理和错误处理
 */

const APP_CONFIG = {
  TARGET_URL: 'https://moligod.com/',
  TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
};

const App = {
  state: {
    loaded: false,
    retryCount: 0,
    isOnline: navigator.onLine,
  },

  elements: {
    splash: document.getElementById('splash'),
    webview: document.getElementById('webview'),
    errorScreen: document.getElementById('error-screen'),
    errorDetail: document.getElementById('error-detail'),
    retryBtn: document.getElementById('retry-btn'),
    statusText: document.getElementById('status-text'),
    offlineIndicator: document.getElementById('offline-indicator'),
  },

  loadTimeout: null,

  init() {
    this.bindEvents();
    this.loadWebsite();
    this.log('应用已初始化');
  },

  bindEvents() {
    // 按钮点击
    this.elements.retryBtn.addEventListener('click', () => {
      this.hideError();
      this.loadWebsite();
    });

    // WebView 加载成功
    this.elements.webview.addEventListener('load', () => {
      this.onLoadSuccess();
    });

    // WebView 加载错误
    this.elements.webview.addEventListener('error', (e) => {
      this.onLoadError(e.message || '加载失败');
    });

    // 网络状态监听
    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.hideOffline();
      if (!this.state.loaded) {
        this.loadWebsite();
      }
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.showOffline();
    });

    // 设备就绪（Capacitor）
    if (typeof window.Capacitor !== 'undefined') {
      window.Capacitor.Plugins.Device?.getInfo?.()
        .then((info) => {
          this.log(`设备: ${info.platform} ${info.model}`);
        })
        .catch(() => {});
    }
  },

  loadWebsite() {
    this.state.loaded = false;
    this.updateStatus('正在连接服务器...');

    // 清除旧的超时
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }

    // 设置新的超时
    this.loadTimeout = setTimeout(() => {
      if (!this.state.loaded) {
        this.onLoadError('连接超时，请检查网络');
      }
    }, APP_CONFIG.TIMEOUT_MS);

    // 开始加载目标网站
    try {
      this.elements.webview.src = APP_CONFIG.TARGET_URL;
    } catch (err) {
      this.onLoadError(err.message);
    }
  },

  onLoadSuccess() {
    if (this.state.loaded) return;

    this.state.loaded = true;
    this.state.retryCount = 0;

    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }

    this.updateStatus('加载完成');
    this.hideSplash();
    this.showWebView();
    this.log('网站加载成功');
  },

  onLoadError(message) {
    if (this.state.loaded) return;

    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
    }

    this.state.retryCount++;

    if (this.state.retryCount < APP_CONFIG.MAX_RETRIES) {
      this.updateStatus(`重试中 (${this.state.retryCount}/${APP_CONFIG.MAX_RETRIES})...`);
      setTimeout(() => this.loadWebsite(), 1500);
      return;
    }

    this.log('加载失败:', message);
    this.showError(message);
  },

  showWebView() {
    this.elements.webview.classList.add('loaded');
  },

  hideWebView() {
    this.elements.webview.classList.remove('loaded');
  },

  showSplash() {
    this.elements.splash.classList.remove('hidden');
  },

  hideSplash() {
    this.elements.splash.classList.add('hidden');
  },

  showError(message) {
    this.elements.errorDetail.textContent = message || '';
    this.elements.errorScreen.classList.remove('hidden');
  },

  hideError() {
    this.elements.errorScreen.classList.add('hidden');
  },

  showOffline() {
    this.elements.offlineIndicator.classList.remove('hidden');
  },

  hideOffline() {
    this.elements.offlineIndicator.classList.add('hidden');
  },

  updateStatus(text) {
    this.elements.statusText.textContent = text;
  },

  log(...args) {
    // eslint-disable-next-line no-console
    console.log('[Moligod]', ...args);
  },
};

// 立即初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// 暴露给外部调试
window.__MOLIGOD_APP__ = App;
