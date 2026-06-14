/**
 * Moligod 移动端应用主脚本
 * 配合 Capacitor 直接加载外部 URL，实现网站实时更新
 * 注意：本文件作为 fallback 使用，主要由 Capacitor BridgeActivity 直接加载外部网站
 */

const App = {
  state: {
    loaded: false,
    retryCount: 0,
    isOnline: navigator.onLine,
  },

  elements: {
    splash: null,
    errorScreen: null,
    errorDetail: null,
    retryBtn: null,
    statusText: null,
    offlineIndicator: null,
  },

  init() {
    this.elements.splash = document.getElementById('splash');
    this.elements.errorScreen = document.getElementById('error-screen');
    this.elements.errorDetail = document.getElementById('error-detail');
    this.elements.retryBtn = document.getElementById('retry-btn');
    this.elements.statusText = document.getElementById('status-text');
    this.elements.offlineIndicator = document.getElementById('offline-indicator');

    this.bindEvents();
    this.log('Moligod App 已初始化 - 网站实时加载模式');

    // 网络状态检测
    if (!this.state.isOnline) {
      this.showOffline();
    }
  },

  bindEvents() {
    // 重试按钮
    this.elements.retryBtn?.addEventListener('click', () => {
      this.hideError();
      this.updateStatus('正在重试...');
      setTimeout(() => {
        // 刷新页面以重新加载网站
        window.location.reload();
      }, 500);
    });

    // 设备就绪（Capacitor）
    if (typeof window.Capacitor !== 'undefined') {
      window.Capacitor.Plugins.Device?.getInfo?.()
        .then((info) => {
          this.log(`设备: ${info.platform} ${info.model}`);
        })
        .catch(() => {});

      // App 生命周期
      window.Capacitor.Plugins.App?.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          this.log('App 回到前台 - 将加载最新数据');
          // 回到前台时自动刷新以获取最新数据
          // window.location.reload();
        }
      });
    }

    // 在线/离线
    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.hideOffline();
      this.log('网络已恢复');
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.showOffline();
      this.log('网络已断开');
    });
  },

  showOffline() {
    if (this.elements.offlineIndicator) {
      this.elements.offlineIndicator.classList.remove('hidden');
    }
  },

  hideOffline() {
    if (this.elements.offlineIndicator) {
      this.elements.offlineIndicator.classList.add('hidden');
    }
  },

  showError(message) {
    if (this.elements.errorScreen) {
      this.elements.errorScreen.classList.remove('hidden');
    }
    if (this.elements.errorDetail && message) {
      this.elements.errorDetail.textContent = message;
    }
    if (this.elements.splash) {
      this.elements.splash.classList.add('hidden');
    }
  },

  hideError() {
    if (this.elements.errorScreen) {
      this.elements.errorScreen.classList.add('hidden');
    }
  },

  updateStatus(text) {
    if (this.elements.statusText) {
      this.elements.statusText.textContent = text;
    }
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

// 暴露给外部
window.__MOLIGOD_APP__ = App;
