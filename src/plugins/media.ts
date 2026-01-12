
import { Plugin } from '../core';

// Codec Support
export const codecPlugin: Plugin = {
  name: 'Codec Support',
  key: 'codecs',
  execute: () => {
    const video = document.createElement('video');
    const audio = document.createElement('audio');
    return {
      h264: video.canPlayType('video/mp4; codecs="avc1.42E01E"') === "probably",
      h265: video.canPlayType('video/mp4; codecs="hev1"') === "probably",
      vp9: video.canPlayType('video/webm; codecs="vp9"') === "probably",
      av1: video.canPlayType('video/mp4; codecs="av01.0.05M.08"') === "probably",
      aac: audio.canPlayType('audio/aac') === "probably",
      flac: audio.canPlayType('audio/flac') === "probably"
    };
  }
};
