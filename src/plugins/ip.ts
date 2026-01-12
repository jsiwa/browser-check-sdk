
import { Plugin } from '../core';

export const ipPlugin: Plugin = {
  name: 'IP Information',
  key: 'ip',
  execute: async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        ip: data.ip,
        city: data.city,
        country: data.country_name,
        timezone: data.timezone,
        org: data.org
      };
    } catch (e) {
      return { error: 'Failed to fetch IP info' };
    }
  }
};

export const webRTCIPPlugin: Plugin = {
  name: 'WebRTC IP Leak',
  key: 'webrtc',
  execute: async () => {
    return new Promise((resolve) => {
      const ips: { public: string | null; local: string | null } = { public: null, local: null };
      try {
        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        pc.createDataChannel('');
        pc.onicecandidate = (e) => {
          if (!e.candidate) {
            pc.close();
            resolve(ips);
            return;
          }
          const cand = e.candidate.candidate;
          const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|([a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}))/g;
          const match = cand.match(ipRegex);
          if (match) {
            const ip = match[0];
            if (ip.includes('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
              ips.local = ip;
            } else {
              ips.public = ip;
            }
          }
        };
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        setTimeout(() => {
          pc.close();
          resolve(ips);
        }, 1500);
      } catch (e) {
        resolve({ error: 'WebRTC not supported' });
      }
    });
  }
};
