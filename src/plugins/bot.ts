
import { Plugin } from '../core';

export const botPlugin: Plugin = {
  name: 'Bot Detection',
  key: 'bot',
  execute: () => {
    const ua = navigator.userAgent;
    
    // Count navigator properties
    let navigatorCount = 0;
    // @ts-ignore
    for (const key in navigator) {
      navigatorCount++;
    }
    
    const botChecks = {
      webdriver: navigator.webdriver,
      // @ts-ignore
      selenium: !!window.cdc_adoQpoasnfa76pfcZLmcfl_Array || !!window.navigator.webdriver,
      puppeteer: /HeadlessChrome/.test(ua),
      // @ts-ignore
      phantom: !!window._phantom || !!window.callPhantom,
      // @ts-ignore
      nightmare: !!window.__nightmare,
      devToolsOpen: window.outerWidth - window.innerWidth > 160,
      navigatorCount
    };
    
    const isBot = Object.values(botChecks).some(val => val === true && typeof val === 'boolean');
    
    return {
      isBot,
      details: botChecks
    };
  }
};
