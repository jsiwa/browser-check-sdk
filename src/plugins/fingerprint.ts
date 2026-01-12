
import { Plugin, PluginContext } from '../core';

// Canvas Fingerprint (Enhanced)
export const canvasPlugin: Plugin = {
  name: 'Canvas Fingerprint',
  key: 'canvas',
  execute: ({ utils }: PluginContext) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return { hash: "ERROR", rawLength: 0 };
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("BrowserCheck", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("BrowserCheck", 4, 17);
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = "rgb(255,0,255)";
      ctx.beginPath(); ctx.arc(50, 50, 50, 0, Math.PI * 2, true); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgb(0,255,255)";
      ctx.beginPath(); ctx.arc(100, 50, 50, 0, Math.PI * 2, true); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgb(255,255,0)";
      ctx.beginPath(); ctx.arc(75, 100, 50, 0, Math.PI * 2, true); ctx.closePath(); ctx.fill();
      const dataURI = canvas.toDataURL();
      return { hash: utils.generateHash(dataURI), rawLength: dataURI.length };
    } catch (e) {
      return { hash: "ERROR", error: (e as Error).message };
    }
  }
};

// Audio Fingerprint (Enhanced)
export const audioPlugin: Plugin = {
  name: 'Audio Fingerprint',
  key: 'audio',
  execute: async ({ utils }: PluginContext) => {
    try {
      // @ts-ignore
      const AudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!AudioContext) return { hash: "UNSUPPORTED", status: "No API" };
      const context = new AudioContext(1, 44100, 44100);
      const oscillator = context.createOscillator();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(10000, context.currentTime);
      const compressor = context.createDynamicsCompressor();
      [['threshold', -50], ['knee', 40], ['ratio', 12], ['reduction', -20], ['attack', 0], ['release', 0.25]].forEach((item) => {
        // @ts-ignore
        if (compressor[item[0]] && typeof compressor[item[0]].value !== 'undefined') compressor[item[0]].value = item[1];
      });
      oscillator.connect(compressor);
      compressor.connect(context.destination);
      oscillator.start(0);
      const buffer = await context.startRendering();
      const data = buffer.getChannelData(0).slice(4500, 5000);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += Math.abs(data[i]);
      return { hash: utils.generateHash(sum.toString()), noiseLevel: sum };
    } catch (e) {
      return { hash: "ERROR", error: (e as Error).message };
    }
  }
};

// WebGL Fingerprint
export const webGLPlugin: Plugin = {
  name: 'WebGL Info',
  key: 'webgl',
  execute: ({ utils }: PluginContext) => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { supported: false };
      // @ts-ignore
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      // @ts-ignore
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : "Unknown";
      // @ts-ignore
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "Unknown";
      // @ts-ignore
      const extensions = gl.getSupportedExtensions();
      return {
        supported: true,
        vendor,
        renderer,
        extensionsCount: extensions ? extensions.length : 0,
        hash: utils.generateHash(vendor + renderer + (extensions ? extensions.length : 0))
      };
    } catch (e) {
      return { supported: false, error: (e as Error).message };
    }
  }
};

// WebGPU Detection
export const webGPUPlugin: Plugin = {
  name: 'WebGPU Info',
  key: 'webgpu',
  execute: async () => {
    // @ts-ignore
    if (!navigator.gpu) return { supported: false };
    try {
      // @ts-ignore
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return { supported: true, adapter: 'N/A' };
      const info = await adapter.requestAdapterInfo();
      return {
        supported: true,
        vendor: info.vendor || 'Unknown',
        architecture: info.architecture || 'Unknown',
        device: info.device || 'Unknown',
        description: info.description || 'WebGPU Adapter'
      };
    } catch (e) {
      return { supported: true, error: "Access Denied" };
    }
  }
};

// ClientRects Fingerprint
export const clientRectsPlugin: Plugin = {
  name: 'ClientRects Fingerprint',
  key: 'clientRects',
  execute: ({ utils }: PluginContext) => {
    try {
      const div = document.createElement('div');
      div.style.cssText = 'position: absolute; left: -9999px; visibility: hidden; font-size: 16px; font-family: Arial;';
      div.innerHTML = 'BrowserCheck ClientRects Fingerprint <div>Sub Element</div>';
      document.body.appendChild(div);
      const rects = div.getClientRects();
      const subDiv = div.querySelector('div');
      const subRects = subDiv ? subDiv.getClientRects() : [];
      let fingerprint = "";
      // @ts-ignore
      for (const rect of rects) fingerprint += `${rect.x},${rect.y},${rect.width},${rect.height};`;
      // @ts-ignore
      for (const rect of subRects) fingerprint += `${rect.x},${rect.y},${rect.width},${rect.height};`;
      document.body.removeChild(div);
      return { hash: utils.generateHash(fingerprint), raw: fingerprint };
    } catch(e) {
      return { hash: "ERROR" };
    }
  }
};

// Math Fingerprint
export const mathPlugin: Plugin = {
  name: 'Math Fingerprint',
  key: 'math',
  execute: ({ utils }: PluginContext) => {
    const a = Math.acos(0.123) * 1e18;
    const b = Math.asin(0.123) * 1e18;
    const c = Math.atan(0.123) * 1e18;
    const d = Math.exp(0.123) * 1e18;
    const e = Math.log(1.123) * 1e18;
    const f = Math.tan(0.123) * 1e18;
    const magic = (a + b + c + d + e + f).toString();
    return { hash: utils.generateHash(magic), raw: magic.substring(0, 15) + '...' };
  }
};
