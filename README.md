# BrowserCheck SDK

<div align="center">
  <h3>🛡️ 强大的浏览器指纹检测和风险评估 SDK</h3>
  <p>完整的插件式浏览器指纹识别、机器人检测和风险评分系统</p>
</div>

## ✨ 特性

- 🎯 **模块化插件系统** - 灵活的插件架构，按需使用
- 🔍 **多维度指纹识别** - Canvas、WebGL、Audio、字体等多种指纹技术
- 🤖 **智能机器人检测** - 检测 Selenium、Puppeteer、Headless Chrome 等
- 🌍 **地理位置和IP分析** - IP信息、WebRTC泄漏检测、时区验证
- 📊 **风险评分系统** - 综合评估浏览器环境的真实性
- 🎨 **精美的可视化界面** - 开箱即用的 React 展示页面
- 📦 **TypeScript 支持** - 完整的类型定义

## 🚀 快速开始

### 安装

```bash
npm install browser-check-sdk
```

### 基础使用

```typescript
import { 
  BrowserCheck,
  canvasPlugin,
  botPlugin,
  ipPlugin 
} from 'browser-check-sdk';

// 创建实例并注册插件
const checker = new BrowserCheck([
  canvasPlugin,
  botPlugin,
  ipPlugin
]);

// 执行扫描
const result = await checker.scan();

console.log('风险评分:', result.score);
console.log('风险等级:', result.riskLevel);
console.log('检测数据:', result.data);
```

## 🔌 可用插件

### 指纹识别插件

```typescript
import {
  canvasPlugin,      // Canvas 指纹
  audioPlugin,       // Audio 指纹
  webGLPlugin,       // WebGL 指纹
  webGPUPlugin,      // WebGPU 检测
  clientRectsPlugin, // ClientRects 指纹
  mathPlugin,        // Math 指纹
  fontPlugin         // 字体检测
} from 'browser-check-sdk';
```

### 检测插件

```typescript
import {
  botPlugin,         // 机器人检测
  adBlockPlugin,     // 广告拦截器检测
  apisPlugin,        // 浏览器 API 检测
  navigatorPlugin    // Navigator 属性检测
} from 'browser-check-sdk';
```

### 网络和硬件插件

```typescript
import {
  ipPlugin,          // IP 信息
  webRTCIPPlugin,    // WebRTC IP 泄漏检测
  screenPlugin,      // 屏幕信息
  hardwarePlugin,    // 硬件信息
  incognitoPlugin,   // 隐私模式检测
  codecPlugin        // 媒体编解码器支持
} from 'browser-check-sdk';
```

## 📖 完整示例

```typescript
import { 
  BrowserCheck,
  // 指纹插件
  canvasPlugin,
  audioPlugin,
  webGLPlugin,
  webGPUPlugin,
  clientRectsPlugin,
  mathPlugin,
  // 检测插件
  botPlugin,
  adBlockPlugin,
  // 网络和硬件
  ipPlugin,
  webRTCIPPlugin,
  screenPlugin,
  hardwarePlugin,
  incognitoPlugin,
  codecPlugin,
  fontPlugin
} from 'browser-check-sdk';

async function runFullScan() {
  const checker = new BrowserCheck([
    // 注册所有插件
    canvasPlugin,
    audioPlugin,
    webGLPlugin,
    webGPUPlugin,
    clientRectsPlugin,
    mathPlugin,
    botPlugin,
    adBlockPlugin,
    ipPlugin,
    webRTCIPPlugin,
    screenPlugin,
    hardwarePlugin,
    incognitoPlugin,
    codecPlugin,
    fontPlugin
  ]);

  const result = await checker.scan();

  // 检查是否为机器人
  if (result.data.bot?.isBot) {
    console.warn('检测到机器人！');
  }

  // 检查IP泄漏
  if (result.data.ip?.ip !== result.data.webrtc?.public) {
    console.warn('检测到 WebRTC IP 泄漏！');
  }

  // 风险评分
  console.log(`风险评分: ${result.score}/100`);
  console.log(`风险等级: ${result.riskLevel}`);

  return result;
}

runFullScan();
```

## 🎨 运行开发页面

本项目包含一个功能完整的可视化展示页面：

```bash
# 进入 dev 目录
cd dev

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 查看完整的检测界面。

### 开发页面特性

- ✅ 实时检测和展示所有指纹数据
- ✅ 网络信息和地理位置可视化
- ✅ 风险评分和平台模拟器（Google、Meta、TikTok、Stripe、Cloudflare）
- ✅ 硬件和软件信息展示
- ✅ 机器人检测和行为分析
- ✅ 字体检测和端口扫描
- ✅ 导出完整 JSON 报告

## 📊 返回数据结构

```typescript
interface ScanResult {
  timestamp: string;      // 扫描时间戳
  score: number;          // 风险评分 (0-100)
  riskLevel: string;      // 风险等级
  deductions: string[];   // 扣分原因
  data: {
    // 各插件返回的数据
    canvas?: { hash: string };
    audio?: { hash: string };
    webgl?: { vendor: string; renderer: string };
    bot?: { isBot: boolean; details: any };
    ip?: { ip: string; city: string; country: string };
    // ... 更多
  };
}
```

## 🔧 自定义插件

创建自己的检测插件：

```typescript
import { Plugin, PluginContext } from 'browser-check-sdk';

export const customPlugin: Plugin = {
  name: 'Custom Detection',
  key: 'custom',
  execute: async ({ utils }: PluginContext) => {
    // 你的检测逻辑
    const data = {
      customValue: 'some value'
    };
    
    // 可以使用工具函数生成哈希
    const hash = utils.generateHash(JSON.stringify(data));
    
    return {
      hash,
      ...data
    };
  }
};

// 使用自定义插件
const checker = new BrowserCheck([customPlugin]);
```

## 🎯 风险评分逻辑

系统会根据以下因素自动计算风险评分：

- **机器人检测** (-40分) - 检测到 WebDriver、Headless Chrome 等
- **软件渲染器** (-25分) - 使用 SwiftShader 等软件渲染
- **时区不匹配** (-10分) - IP 时区与系统时区不一致
- **IP 不匹配** (-10分) - HTTP IP 与 WebRTC IP 不一致
- **异常行为** (-10分) - 鼠标移动熵值过低

评分范围：
- **80-100分**: 安全 (Low Risk)
- **60-79分**: 中风险 (Medium Risk)
- **0-59分**: 高风险 (High Risk)

## 🌐 浏览器支持

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系

如有问题或建议，请提交 Issue。

---

<div align="center">
  Initialized with ❤️ by Manus AI and Gemini
</div>
