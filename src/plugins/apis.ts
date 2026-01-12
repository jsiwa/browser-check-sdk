
import { Plugin } from '../core';

// Browser APIs Detection
export const apisPlugin: Plugin = {
  name: 'Browser APIs',
  key: 'apis',
  execute: () => {
    return {
      // @ts-ignore
      bluetooth: !!navigator.bluetooth,
      // @ts-ignore
      usb: !!navigator.usb,
      pdfViewer: navigator.pdfViewerEnabled,
      // @ts-ignore
      doNotTrack: navigator.doNotTrack || window.doNotTrack || null,
      // @ts-ignore
      javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
      cookieEnabled: navigator.cookieEnabled,
      // @ts-ignore
      webAssembly: typeof WebAssembly === 'object',
      // @ts-ignore
      clipboard: !!navigator.clipboard,
      // @ts-ignore
      sensors: 'Sensor' in window,
      // @ts-ignore
      webRTC: !!window.RTCPeerConnection,
      // @ts-ignore
      webGL: !!document.createElement('canvas').getContext('webgl'),
      // @ts-ignore
      webGPU: !!navigator.gpu,
      serviceWorker: 'serviceWorker' in navigator,
      notification: 'Notification' in window,
      geolocation: 'geolocation' in navigator
    };
  }
};

// AdBlock Detection
export const adBlockPlugin: Plugin = {
  name: 'AdBlock Detection',
  key: 'adblock',
  execute: async () => {
    const ad = document.createElement('div');
    ad.innerHTML = '&nbsp;';
    ad.className = 'adsbox'; 
    ad.style.position = 'absolute';
    ad.style.top = '-999px';
    ad.style.width = '1px';
    ad.style.height = '1px';
    document.body.appendChild(ad);
    await new Promise(r => setTimeout(r, 100));
    const isBlocked = ad.offsetHeight === 0 || ad.style.display === 'none';
    document.body.removeChild(ad);
    return { detected: isBlocked };
  }
};

// Navigator Properties Count
export const navigatorPlugin: Plugin = {
  name: 'Navigator Properties',
  key: 'navigator',
  execute: () => {
    let count = 0;
    // @ts-ignore
    for (const key in navigator) {
      count++;
    }
    return {
      propertyCount: count,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages || [navigator.language],
      onLine: navigator.onLine,
      vendor: navigator.vendor,
      vendorSub: navigator.vendorSub
    };
  }
};
