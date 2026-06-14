# Moligod 移动端应用

> 将 https://moligod.com 打包为可安装的 Android / iOS 应用
> 基于 **Capacitor 5** (Ionic) + 现代 WebView

---

## 📱 功能特性

- ✅ 直接加载 moligod.com 网站
- ✅ Android 8.0+ (API 22+) 支持
- ✅ iOS 13.0+ 支持 (在 macOS 构建)
- ✅ 深色科技风启动界面（霓虹灯动效）
- ✅ 实时离线检测与重连机制
- ✅ 全屏幕沉浸模式 & 刘海屏安全区适配
- ✅ 相机 / 麦克风 / 地理位置权限支持
- ✅ 应用图标 & 自适应图标（圆形 / 方形）
- ✅ 可选 PWA 模式（浏览器直接安装）
- ✅ 键盘弹起事件、状态栏颜色、触觉反馈插件

## 🎯 快速开始（3 步构建 APK）

### 1. 安装依赖

```bash
# 先确认 Node.js 版本 >= 18
node -v  # 需要 >= 18

cd moligod-mobile-app
npm install
```

### 2. 同步 Capacitor 项目

```bash
# 复制 web 资源 + 同步原生插件
npx cap sync

# 检查平台状态
npx cap doctor
```

### 3. 构建 APK —— 两种方式

**方式 A: 使用 Android Studio (推荐新手)**

```bash
# 用 Android Studio 打开 android 目录
npx cap open android

# 在 Android Studio 中:
#   Build → Build Bundle(s) / APK → Build APK
# 产物路径: android/app/build/outputs/apk/debug/app-debug.apk
```

**方式 B: 命令行（需要 JDK 17+ 和 Android SDK）**

```bash
cd android

# Windows 用户:
.\gradlew.bat assembleDebug

# macOS/Linux 用户:
./gradlew assembleDebug

# 成功后 APK 位于:
#   android/app/build/outputs/apk/debug/app-debug.apk
# 直接传到 Android 手机安装即可 ✅
```

---

## 🏗️ 项目结构

```
moligod-mobile-app/
├── web/                          # Web 前端（Capacitor 启动页）
│   ├── index.html                # 主页面 + WebView 加载逻辑
│   ├── css/style.css             # 深色霓虹风格样式
│   ├── js/app.js                 # 加载 / 错误 / 网络状态处理
│   ├── manifest.json             # PWA 应用清单
│   └── assets/icons/             # 192x192 / 512x512 PNG 图标
├── android/                      # Android 项目（可直接用 Android Studio 打开）
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml   # 权限声明 + 入口 Activity
│   │   ├── java/com/moligod/market/MainActivity.java
│   │   └── res/                  # 图标 / 主题 / 字符串资源
│   ├── build.gradle              # 根构建脚本 (AGP 8.2.2)
│   ├── settings.gradle           # 插件模块包含配置
│   ├── variables.gradle          # SDK 版本变量
│   ├── gradle.properties         # Gradle / AndroidX 配置
│   ├── gradle/wrapper/           # Gradle 8.5 包装器
│   └── capacitor-*/              # 6 个 Capacitor 插件模块
│       ├── build.gradle
│       └── AndroidManifest.xml
├── capacitor.config.json         # Capacitor 主配置
├── package.json                  # npm 依赖
├── .gitignore
└── scripts/
    └── generate-icons.js         # 图标生成脚本（纯 Node.js，无外部依赖）
```

---

## 🔧 自定义配置

### 修改加载的网站地址

编辑 `capacitor.config.json`：

```json
{
  "server": {
    "url": "https://moligod.com/",   // ← 修改这里
    "cleartext": true,
    "allowNavigation": ["moligod.com"]
  }
}
```

然后执行 `npx cap sync` 生效。

### 修改应用名称 / 图标

1. **名称**: 修改 `capacitor.config.json` 中的 `appName`
2. **图标**: 将你的 PNG 放入 `web/assets/icons/` 或 Android 的 `res/mipmap-*/`
3. **颜色**: 修改 `android/app/src/main/res/values/colors.xml`

### 重新生成图标（使用脚本）

```bash
node scripts/generate-icons.js
# 自动生成: Android mipmap / Web icons / 启动图
```

---

## 📦 构建发布版 APK（签名）

1. **生成签名密钥**:

```bash
keytool -genkey -v -keystore moligod-release.keystore \
  -alias moligod -keyalg RSA -keysize 2048 -validity 10000
```

2. **编辑 `android/app/build.gradle`** 添加 signingConfigs:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("moligod-release.keystore")
            storePassword "你的密码"
            keyAlias "moligod"
            keyPassword "你的密码"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. **构建**:

```bash
cd android
./gradlew assembleRelease
# 产物: app/build/outputs/apk/release/app-release.apk
```

---

## 🍎 iOS 构建（需要 macOS + Xcode）

```bash
# 1. 添加 iOS 平台
npx cap add ios

# 2. 同步 Web 资源
npx cap sync

# 3. 打开 Xcode
npx cap open ios

# 4. Xcode 中:
#    - 选择 Team (签名证书)
#    - Product → Archive → Distribute App
#    - 生成 .ipa 或上传 App Store
```

---

## 🌐 PWA 模式（无需原生构建）

将 `web/` 目录部署到任何静态服务器:

```bash
# 本地测试:
npm install -g serve
cd web && serve -p 3000

# 浏览器打开:
# http://localhost:3000
# 菜单 -> 安装应用 -> 即获得桌面/手机 PWA
```

---

## 🛠️ 常见问题 FAQ

### Q1: npm install 很慢 / 网络错误

```bash
# 使用国内镜像:
npm config set registry https://registry.npmmirror.com
npm install
```

### Q2: Gradle 构建报错 "SDK location not found"

创建 `android/local.properties` 文件:

```properties
# Windows:
sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk

# macOS:
sdk.dir=/Users/yourname/Library/Android/sdk
```

或者复制 `local.properties.example` → `local.properties` 后编辑路径。

### Q3: 打开 moligod.com 是空白页？

可能原因:
1. 网络不通 → 检查手机/模拟器 Wi-Fi
2. CSP / iframe 限制 → 该网站若禁止被嵌入，WebView 无法加载
3. 需启用 JavaScript（已默认开启）

### Q4: 如何升级到 Capacitor 6？

```bash
# 查看最新版本:
npm view @capacitor/core version

# 升级:
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest
npx cap migrate
```

### Q5: 文件太大？图标怎么替换？

- 用脚本 `node scripts/generate-icons.js` 生成默认图标
- 或使用在线工具: https://icon.kitchen/ 生成后替换各 mipmap 目录

---

## 📄 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| **Capacitor** | 5.7.4 | 跨平台桥接框架 |
| **Android Gradle Plugin** | 8.2.2 | Android 构建工具 |
| **Gradle** | 8.5 | 构建系统 |
| **Kotlin** | 1.9.22 | Android 插件语言 |
| **minSdk** | 22 | 兼容 Android 8.0+ |
| **targetSdk** | 34 | 适配 Android 14 |
| **Java** | 17 | JDK 版本要求 |

---

## 📚 文档 & 资源

- **Capacitor 官方文档**: https://capacitorjs.com/docs
- **Android Studio 下载**: https://developer.android.com/studio
- **Capacitor 插件列表**: https://capacitorjs.com/docs/plugins
- **moligod.com**: https://moligod.com

---

## 📝 License

MIT License — 本项目仅用于个人学习与使用

---

## 🚀 一键构建命令（完整版）

```bash
cd moligod-mobile-app
npm install
npx cap sync
cd android
./gradlew assembleDebug
# 完成! APK 位于:
# android/app/build/outputs/apk/debug/app-debug.apk
```

祝你好运 🎉
