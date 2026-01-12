
export interface PluginContext {
  utils: {
    generateHash: (str: string) => string;
  };
}

export interface Plugin {
  name: string;
  key: string;
  execute: (ctx: PluginContext) => Promise<any> | any;
}

export interface ScanResult {
  timestamp: string;
  data: Record<string, any>;
  score: number;
  riskLevel: string;
}

export class BrowserCheck {
  private plugins: Plugin[] = [];

  constructor(plugins: Plugin[] = []) {
    this.plugins = plugins;
  }

  use(plugin: Plugin): this {
    this.plugins.push(plugin);
    return this;
  }

  private utils = {
    generateHash: (str: string) => {
      let hash = 5381;
      for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
      }
      return (hash >>> 0).toString(16).toUpperCase();
    }
  };

  async scan(): Promise<ScanResult> {
    const results: Record<string, any> = {};
    const promises = this.plugins.map(async (plugin) => {
      try {
        results[plugin.key] = await plugin.execute({ utils: this.utils });
      } catch (e) {
        results[plugin.key] = { error: (e as Error).message };
      }
    });

    await Promise.all(promises);

    // 风险评分逻辑
    let score = 100;
    const deductions: string[] = [];
    
    if (results.bot?.isBot) {
      score -= 40;
      deductions.push("Bot Detected (-40%)");
    }
    
    if (results.webgl?.renderer?.includes('SwiftShader')) {
      score -= 25;
      deductions.push("Software Renderer (-25%)");
    }
    
    // 时区不一致检测
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const ipTimezone = results.ip?.timezone;
    if (ipTimezone && ipTimezone !== 'Unknown' && ipTimezone !== localTimezone) {
      score -= 10;
      deductions.push("Timezone Mismatch (-10%)");
    }
    
    // IP不一致检测 (WebRTC vs HTTP)
    const httpIP = results.ip?.ip;
    const webrtcIP = results.webrtc?.public;
    if (webrtcIP && httpIP && webrtcIP !== httpIP) {
      score -= 10;
      deductions.push("IP Mismatch (-10%)");
    }
    
    let riskLevel = '安全 (Low Risk)';
    if (score < 60) riskLevel = '高风险 (High Risk)';
    else if (score < 85) riskLevel = '中风险 (Medium Risk)';

    return {
      timestamp: new Date().toISOString(),
      data: results,
      score: Math.max(0, score),
      riskLevel,
      // @ts-ignore
      deductions
    };
  }
}
