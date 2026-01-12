
import { Plugin } from '../core';

// Screen Information
export const screenPlugin: Plugin = {
  name: 'Screen Information',
  key: 'screen',
  execute: () => {
    return {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      touch: navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints
    };
  }
};

// Hardware Information
export const hardwarePlugin: Plugin = {
  name: 'Hardware Information',
  key: 'hardware',
  execute: async () => {
    const hwConcurrency = navigator.hardwareConcurrency || 0;
    // @ts-ignore
    const deviceMemory = navigator.deviceMemory || 0;
    
    // Battery API
    let battery = null;
    try {
      // @ts-ignore
      if (navigator.getBattery) {
        // @ts-ignore
        battery = await navigator.getBattery();
        battery = {
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };
      }
    } catch (e) {
      battery = null;
    }

    // Storage Estimation
    let storage = null;
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        storage = {
          quota: estimate.quota,
          usage: estimate.usage,
          available: (estimate.quota || 0) - (estimate.usage || 0)
        };
      } catch (e) {
        storage = null;
      }
    }

    return {
      concurrency: hwConcurrency,
      memory: deviceMemory,
      battery,
      storage
    };
  }
};

// Incognito Detection (Heuristic)
export const incognitoPlugin: Plugin = {
  name: 'Incognito Detection',
  key: 'incognito',
  execute: async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        // @ts-ignore
        const { quota } = await navigator.storage.estimate();
        // Chrome incognito usually has a specific quota cap (~120MB)
        if (quota && quota < 120000000) return { isIncognito: true, method: 'storage_quota' };
      } catch (e) {
        // ignore
      }
    }
    return { isIncognito: false };
  }
};
