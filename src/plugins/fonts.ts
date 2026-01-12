
import { Plugin } from '../core';

const FONT_LIST = [
  "Arial", "Helvetica", "arial", "Arial Black", "Arial Narrow", "Brush Script MT", "Comic Sans MS", "Courier", "Courier New", "Georgia", "Microsoft Sans Serif", "Times", "Times New Roman", "Papyrus", "Rockwell", "STFangSong", "STFangsong", "STKaiti", "STSong", "STXihei", "Shree Devanagari 714", "Symbol", "Trebuchet MS", "Verdana", "Webdings", "Wingdings", "Wingdings 2", "Wingdings 3", "BlinkMacSystemFont", "Helvetica Neue", "Noto Sans", "Apple Color Emoji", "Arial Unicode MS", "Gill Sans", "Menlo", "Impact", "Al Bayan", "Al Nile", "Al Tarikh", "American Typewriter", "Andale Mono", "Apple Braille", "Apple Chancery", "Apple SD Gothic Neo", "Apple Symbols", "AppleGothic", "AppleMyungjo", "Arial Hebrew", "Arial Hebrew Scholar", "Arial Rounded MT Bold", "Athelas", "Avenir", "Avenir Black", "Avenir Black Oblique", "Avenir Book", "Avenir Heavy", "Avenir Light", "Avenir Medium", "Avenir Next", "Avenir Next Condensed", "Ayuthaya", "Baghdad", "Bangla MN", "Bangla Sangam MN", "Baskerville", "Beirut", "Big Caslon", "Bodoni 72", "Bodoni 72 Oldstyle", "Bodoni 72 Smallcaps", "Bradley Hand", "Chalkboard", "Chalkboard SE", "Chalkduster", "Charter", "Charter Black", "Cochin", "Copperplate", "Corsiva Hebrew", "DIN Alternate", "DIN Condensed", "Damascus", "DecoType Naskh", "Devanagari MT", "Devanagari Sangam MN", "Didot", "Diwan Kufi", "Diwan Thuluth", "Euphemia UCAS", "Farah", "Farisi", "Futura", "GB18030 Bitmap", "Galvji", "Geeza Pro", "Geneva", "Gujarati MT", "Gujarati Sangam MN", "Gurmukhi MN", "Gurmukhi MT", "Gurmukhi Sangam MN", "Heiti SC", "Heiti TC", "Herculanum", "Hiragino Kaku Gothic Pro", "Hiragino Kaku Gothic ProN", "Hiragino Kaku Gothic Std", "Hiragino Kaku Gothic StdN", "Hiragino Maru Gothic Pro", "Hiragino Maru Gothic ProN", "Hiragino Mincho Pro", "Hiragino Mincho ProN", "Hiragino Sans", "Hiragino Sans GB", "Hoefler Text", "Hoefler Text Ornaments", "ITF Devanagari", "ITF Devanagari Marathi", "InaiMathi", "Iowan Old Style", "Iowan Old Style Black", "Kailasa", "Kannada MN", "Kannada Sangam MN", "Kefa", "Khmer MN", "Khmer Sangam MN", "Kohinoor Bangla", "Kohinoor Devanagari", "Kohinoor Gujarati", "Kohinoor Telugu", "Kokonor", "Krungthep", "KufiStandardGK", "Lao MN", "Lao Sangam MN", "Lucida Grande", "Luminari", "Malayalam MN", "Malayalam Sangam MN", "Marion", "Marker Felt", "Mishafi", "Mishafi Gold", "Monaco", "Mshtakan", "Muna", "Myanmar MN", "Myanmar Sangam MN", "Nadeem", "New Peninim MT", "Noteworthy", "Noto Nastaliq Urdu", "Noto Sans Armenian", "Noto Sans Kannada", "Noto Sans Myanmar", "Noto Sans Oriya", "Optima", "Oriya MN", "Oriya Sangam MN", "PT Mono", "PT Sans", "PT Sans Caption", "PT Sans Narrow", "PT Serif", "PT Serif Caption", "Palatino", "Phosphate", "PingFang HK", "PingFang SC", "PingFang TC", "Plantagenet Cherokee", "Raanana", "STIXGeneral", "STIXIntegralsD", "STIXIntegralsSm", "STIXIntegralsUp", "STIXIntegralsUpD", "STIXIntegralsUpSm", "STIXNonUnicode", "STIXSizeFiveSym", "STIXSizeFourSym", "STIXSizeOneSym", "STIXSizeThreeSym", "STIXSizeTwoSym", "STIXVariants", "Sana", "Sathu", "Savoye LET", "Seravek", "Seravek ExtraLight", "Seravek Light", "Seravek Medium", "SignPainter", "SignPainter-HouseScript", "Silom", "Sinhala MN", "Sinhala Sangam MN", "Skia", "Snell Roundhand", "Songti SC", "Songti TC", "Sukhumvit Set", "Superclarendon", "Tamil MN", "Tamil Sangam MN", "Telugu MN", "Telugu Sangam MN", "Thonburi", "Trattatello", "Waseem", "Zapfino", "Academy Engraved LET", "Party LET", "system-ui"
];

// Font Detection
export const fontPlugin: Plugin = {
  name: 'Font Detection',
  key: 'fonts',
  execute: async () => {
    return new Promise<string[]>((resolve) => {
      setTimeout(() => {
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const testString = "mmmmmmmmmmlli";
        const span = document.createElement("span");
        span.style.cssText = "font-size: 72px; visibility: hidden; position: absolute; top: -9999px;";
        span.innerHTML = testString;
        document.body.appendChild(span);
        
        const baseWidths: Record<string, number> = {};
        for (const base of baseFonts) {
          span.style.fontFamily = base;
          baseWidths[base] = span.offsetWidth;
        }
        
        const detected: string[] = [];
        for (const font of FONT_LIST) {
          let matched = false;
          for (const base of baseFonts) {
            span.style.fontFamily = `"${font}", ${base}`;
            if (span.offsetWidth !== baseWidths[base]) {
              matched = true;
              break;
            }
          }
          if (matched) detected.push(font);
        }
        
        document.body.removeChild(span);
        resolve(detected);
      }, 50);
    });
  }
};
