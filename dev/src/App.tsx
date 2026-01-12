import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Fingerprint, 
  Globe, 
  Download, 
  RefreshCw, 
  HardDrive,
  Box,
  Clock,
  Network,
  MapPin,
  Layers,
  Video,
  Zap
} from 'lucide-react';
import { 
  BrowserCheck,
  canvasPlugin,
  audioPlugin,
  webGLPlugin,
  webGPUPlugin,
  clientRectsPlugin,
  mathPlugin,
  botPlugin,
  ipPlugin,
  webRTCIPPlugin,
  screenPlugin,
  hardwarePlugin,
  incognitoPlugin,
  codecPlugin,
  fontPlugin,
  apisPlugin,
  navigatorPlugin,
  adBlockPlugin
} from '../../src/index';

/**
 * ------------------------------------------------------------------
 * 工具函数
 * ------------------------------------------------------------------
 */

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Port Scan
const scanPort = (port: number) => {
    return new Promise<'OPEN' | 'CLOSED' | 'TIMEOUT'>((resolve) => {
        const timeout = 1500;
        const start = Date.now();
        const socket = new WebSocket(`ws://127.0.0.1:${port}`);
        let hasResolved = false;
        const timer = setTimeout(() => {
             if(!hasResolved) {
                 hasResolved = true;
                 socket.close();
                 resolve('TIMEOUT');
             }
        }, timeout);
        socket.onopen = () => {
            if(!hasResolved) {
                hasResolved = true;
                clearTimeout(timer);
                socket.close();
                resolve('OPEN');
            }
        };
        socket.onerror = () => {
            if(!hasResolved) {
                hasResolved = true;
                clearTimeout(timer);
                if (Date.now() - start < 100) resolve('CLOSED');
                else resolve('TIMEOUT');
            }
        };
    });
};

/**
 * ------------------------------------------------------------------
 * UI 组件
 * ------------------------------------------------------------------
 */

const Skeleton = ({ className }: { className?: string }) => (
    <div className={`bg-slate-800/50 animate-pulse rounded ${className}`}></div>
);

const Row = ({ label, value, sub, mono, highlight, loading, warning, error }: any) => {
    return (
        <div className="flex justify-between items-start py-2 border-b border-slate-800 last:border-0 group">
            <span className="text-slate-400 text-xs group-hover:text-slate-300 w-1/3 pr-2 flex items-center">{label}</span>
            <div className="text-right w-2/3 flex flex-col items-end">
                {loading ? (
                    <Skeleton className="h-4 w-24 mb-1" />
                ) : (
                    <>
                        <div className={`text-sm ${mono ? 'font-mono' : ''} 
                            ${error ? 'text-rose-400' : warning ? 'text-amber-400' : highlight ? 'text-emerald-400' : 'text-slate-200'} 
                            break-words leading-tight text-right`}>
                            {value === undefined || value === null ? 'N/A' : value}
                        </div>
                        {sub && <div className="text-[10px] text-slate-500 mt-0.5 text-right">{sub}</div>}
                    </>
                )}
            </div>
        </div>
    );
};

const StatusBadge = ({ status, type = 'normal', loading }: any) => {
    if (loading) return <Skeleton className="h-5 w-16" />;
    let color = "bg-slate-800 text-slate-400 border-slate-700";
    let text = String(status);
    if (type === 'bool') {
        if (status === true) { color = "bg-rose-900/30 text-rose-400 border-rose-800"; text = "DETECTED"; } 
        else { color = "bg-emerald-900/30 text-emerald-400 border-emerald-800"; text = "CLEAN"; }
    } else if (status === 'PASS' || status === 'MATCH') {
        color = "bg-emerald-900/30 text-emerald-400 border-emerald-800";
    } else if (status === 'REVIEW' || status === 'CHALLENGE' || status === 'MANAGED_CHALLENGE') {
        color = "bg-amber-900/30 text-amber-400 border-amber-800";
    } else if (status === 'FAIL' || status === 'HIGH_RISK') {
        color = "bg-rose-900/30 text-rose-400 border-rose-800";
    }
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${color}`}>{text}</span>;
};

const Card = ({ title, icon: Icon, children, className = "" }: any) => (
    <div className={`bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-sm hover:border-slate-700 transition-colors ${className}`}>
      <div className="bg-slate-900/50 p-3 border-b border-slate-800 flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-500" />
        <span className="font-semibold text-slate-200 text-sm">{title}</span>
      </div>
      <div className="p-4 space-y-2">
        {children}
      </div>
    </div>
);

/**
 * ------------------------------------------------------------------
 * 主组件
 * ------------------------------------------------------------------
 */

export default function App() {
  const [data, setData] = useState<any>(null);
  const [portStatus, setPortStatus] = useState<{p22: string, p3389: string} | null>(null);
  const [scanningPorts, setScanningPorts] = useState(false);
  const [entropy, setEntropy] = useState<number | null>(null);
  
  const mouseMovements = useRef<{x: number, y: number, t: number}[]>([]);
  
  const handleInteraction = useCallback((e: MouseEvent | TouchEvent) => {
    if (mouseMovements.current.length < 50) {
      let clientX, clientY;
      if (window.TouchEvent && e instanceof TouchEvent) {
          clientX = e.touches[0]?.clientX;
          clientY = e.touches[0]?.clientY;
      } else if (e instanceof MouseEvent) {
          clientX = e.clientX;
          clientY = e.clientY;
      }
      if (clientX !== undefined) {
          mouseMovements.current.push({ x: clientX, y: clientY!, t: Date.now() });
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchmove', handleInteraction);
    return () => {
        window.removeEventListener('mousemove', handleInteraction);
        window.removeEventListener('touchmove', handleInteraction);
    };
  }, [handleInteraction]);

  const calculateEntropy = () => {
    const moves = mouseMovements.current;
    if (moves.length < 5) return null;
    let irregularMoves = 0;
    for(let i=1; i < moves.length; i++) {
        const dx = moves[i].x - moves[i-1].x;
        const dy = moves[i].y - moves[i-1].y;
        const dt = moves[i].t - moves[i-1].t;
        if (dt > 0 && Math.abs(dx/dt) < 5 && Math.abs(dy/dt) < 5) irregularMoves++;
    }
    return Math.min(Math.floor((irregularMoves / moves.length) * 100 + 20), 99); 
  };

  const runPortScan = async () => {
      setScanningPorts(true);
      const [p22, p3389] = await Promise.all([scanPort(22), scanPort(3389)]);
      setPortStatus({ p22, p3389 });
      setScanningPorts(false);
  };

  const runScan = async () => {
    setData(null);
    mouseMovements.current = [];
    setEntropy(null);
    
    // 创建 SDK 实例
    const checker = new BrowserCheck([
      canvasPlugin,
      audioPlugin,
      webGLPlugin,
      webGPUPlugin,
      clientRectsPlugin,
      mathPlugin,
      botPlugin,
      ipPlugin,
      webRTCIPPlugin,
      screenPlugin,
      hardwarePlugin,
      incognitoPlugin,
      codecPlugin,
      fontPlugin,
      apisPlugin,
      navigatorPlugin,
      adBlockPlugin
    ]);

    // 执行扫描
    const result = await checker.scan();
    
    // 计算熵值
    setTimeout(() => {
      const entropyValue = calculateEntropy();
      setEntropy(entropyValue);
      
      // 根据熵值调整分数
      let adjustedScore = result.score;
      const adjustedDeductions = [...(result as any).deductions];
      
      if (entropyValue !== null && entropyValue < 30) {
        adjustedScore -= 10;
        adjustedDeductions.push("Abnormal mouse behavior (-10%)");
      }
      
      // 风险模拟器
      const riskScores = {
        google: !result.data.bot?.isBot && entropyValue !== null && entropyValue > 40 ? 'PASS' : 'CHALLENGE',
        meta: !result.data.bot?.isBot && (result.data.screen?.touch || result.data.navigator?.platform !== 'Linux x86_64') ? 'PASS' : 'REVIEW',
        tiktok: !result.data.bot?.isBot && result.data.codecs?.h264 && result.data.audio?.hash !== "ERROR" ? 'PASS' : 'FAIL',
        stripe: !(result as any).deductions.includes("Timezone Mismatch (-10%)") && !(result as any).deductions.includes("IP Mismatch (-10%)") ? 'PASS' : 'HIGH_RISK',
        cloudflare: !result.data.bot?.details?.webdriver ? 'PASS' : 'MANAGED_CHALLENGE'
      };
      
      setData({
        ...result,
        score: Math.max(0, adjustedScore),
        deductions: adjustedDeductions,
        entropy: entropyValue,
        riskScores
      });
    }, 600);
  };

  useEffect(() => {
    runScan();
  }, []);

  const downloadReport = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `browsercheck-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 font-sans pb-20 selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded border border-blue-500/20">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">BrowserCheck <span className="text-blue-500">Pro</span></h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">v4.1 SDK Edition</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={runScan} className="p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-400 hover:text-white transition-colors">
                <RefreshCw size={16} className={!data ? "animate-spin" : ""}/>
            </button>
            <button onClick={downloadReport} disabled={!data} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <Download size={14} /> 导出 JSON
            </button>
          </div>
        </div>
      </header>

      {/* Summary Header */}
      {data && (
      <div className="bg-slate-900 border-b border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">IP Address</div>
                <div className="text-2xl font-mono text-white tracking-tight">{data?.data?.ip?.ip || 'Unknown'}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                    <MapPin size={10} /> {data?.data?.ip?.city}, {data?.data?.ip?.country}
                </div>
            </div>
            <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Browser</div>
                <div className="text-lg text-slate-200">{data?.data?.navigator?.userAgent?.match(/(Chrome|Firefox|Safari|Edg)\/(\d+(\.\d+)*)/)?.[0] || 'Unknown'}</div>
                <div className="text-xs text-slate-500 mt-1">{data?.data?.navigator?.platform}</div>
            </div>
            <div>
                 <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Authenticity</div>
                 <div className="flex items-end gap-2">
                    <div className={`text-2xl font-bold ${data?.score >= 80 ? 'text-emerald-400' : data?.score >= 60 ? 'text-amber-400' : 'text-rose-500'}`}>{data?.score}%</div>
                    <div className="text-xs text-slate-500 mb-1">{data?.riskLevel}</div>
                 </div>
                 {data?.deductions?.length > 0 && (
                     <div className="text-[10px] text-rose-400 mt-1">{data.deductions[0]}</div>
                 )}
            </div>
            <div>
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">ISP</div>
                <div className="text-lg text-slate-200 truncate">{data?.data?.ip?.org || 'Unknown'}</div>
                <div className="text-xs text-slate-500 mt-1">
                   {data?.deductions?.includes("IP Mismatch (-10%)") ? <span className="text-rose-400 flex items-center gap-1"><ShieldAlert size={10}/> Proxy Detected</span> : 'No Proxy Detected'}
                </div>
            </div>
        </div>
      </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {/* SECTION: What Websites See (Network & Geo) */}
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 mb-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Globe size={16}/> What Websites See
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Location & Network */}
                    <Card title="Geolocation & ISP" icon={MapPin}>
                        <Row loading={!data} label="Country" value={data?.data?.ip?.country} />
                        <Row loading={!data} label="City" value={data?.data?.ip?.city} />
                        <Row loading={!data} label="Timezone" value={data?.data?.ip?.timezone} />
                        <div className="my-2 border-t border-slate-800"></div>
                        <Row loading={!data} label="ISP" value={data?.data?.ip?.org} />
                        <Row loading={!data} label="Proxy/VPN" value={data?.deductions?.includes("IP Mismatch (-10%)") ? 'Possible' : 'No'} warning={data?.deductions?.includes("IP Mismatch (-10%)")} />
                    </Card>

                    {/* Time & Locale */}
                    <Card title="Time & Locale" icon={Clock}>
                        <Row loading={!data} label="IP Timezone" value={data?.data?.ip?.timezone} />
                        <Row loading={!data} label="System Timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
                        <Row loading={!data} label="Match" value={data?.deductions?.includes("Timezone Mismatch (-10%)") ? "Mismatch ⚠️" : "Match ✓"} 
                             warning={data?.deductions?.includes("Timezone Mismatch (-10%)")} 
                             highlight={!data?.deductions?.includes("Timezone Mismatch (-10%)")} />
                        <div className="my-2 border-t border-slate-800"></div>
                        <Row loading={!data} label="Languages" value={data?.data?.navigator?.languages?.join(', ')} />
                    </Card>

                    {/* WebRTC & Security */}
                    <Card title="WebRTC & Leak Test" icon={Network}>
                        <Row loading={!data} label="Public IP" value={data?.data?.ip?.ip} mono />
                        <Row loading={!data} label="WebRTC Public IP" value={data?.data?.webrtc?.public || 'N/A'} 
                             warning={data?.data?.webrtc?.public && data?.data?.webrtc?.public !== data?.data?.ip?.ip} />
                        <Row loading={!data} label="WebRTC Local IP" value={data?.data?.webrtc?.local || 'N/A'} sub="(e.g. 192.168.x.x)" />
                        <Row loading={!data} label="Leak Detected" value={data?.deductions?.includes("IP Mismatch (-10%)") ? 'YES' : 'No'} 
                             error={data?.deductions?.includes("IP Mismatch (-10%)")} />
                        <div className="my-2 border-t border-slate-800"></div>
                        <Row loading={!data} label="Port 22/3389" value={portStatus ? `${portStatus.p22}/${portStatus.p3389}` : 'Not Scanned'} 
                             sub={!scanningPorts ? <button onClick={runPortScan} className="text-blue-400 hover:underline">Scan Ports</button> : 'Scanning...'}/>
                    </Card>
                </div>
            </div>

            {/* SECTION: Hardware */}
            <Card title="Hardware" icon={HardDrive}>
                <Row loading={!data} label="Visitor ID" value={data?.data?.canvas?.hash?.substring(0,8)} mono />
                <Row loading={!data} label="Screen Resolution" value={`${data?.data?.screen?.width} × ${data?.data?.screen?.height}`} />
                <Row loading={!data} label="Available Size" value={`${data?.data?.screen?.availWidth} × ${data?.data?.screen?.availHeight}`} />
                <Row loading={!data} label="Color Depth" value={data?.data?.screen?.colorDepth} />
                <Row loading={!data} label="Pixel Ratio" value={data?.data?.screen?.pixelRatio} />
                <Row loading={!data} label="Touch Support" value={data?.data?.screen?.touch ? 'Yes' : 'No'} />
                <Row loading={!data} label="CPU Cores" value={data?.data?.hardware?.concurrency} />
                <Row loading={!data} label="Device Memory" value={data?.data?.hardware?.memory ? `~${data?.data?.hardware?.memory} GB` : 'N/A'} />
                <Row loading={!data} label="Storage Quota" value={data?.data?.hardware?.storage?.quota ? formatBytes(data?.data?.hardware?.storage?.quota) : 'N/A'} />
                <Row loading={!data} label="Battery Level" value={data?.data?.hardware?.battery ? `${Math.round(data?.data?.hardware?.battery.level * 100)}%` : 'Unknown'} />
            </Card>

            {/* SECTION: Software */}
            <Card title="Software" icon={Layers}>
                <Row loading={!data} label="OS Platform" value={data?.data?.navigator?.platform} />
                <Row loading={!data} label="User Agent" value={data?.data?.navigator?.userAgent?.substring(0, 30) + '...'} sub={data?.data?.navigator?.userAgent} />
                <Row loading={!data} label="Incognito Mode" value={data?.data?.incognito?.isIncognito ? 'Yes' : 'No'} 
                     highlight={!data?.data?.incognito?.isIncognito} />
                <Row loading={!data} label="Do Not Track" value={data?.data?.apis?.doNotTrack || 'Null'} />
                <Row loading={!data} label="Cookies Enabled" value={data?.data?.apis?.cookieEnabled ? 'Yes' : 'No'} />
                <Row loading={!data} label="PDF Viewer" value={data?.data?.apis?.pdfViewer ? 'Enabled' : 'Disabled'} />
            </Card>

            {/* SECTION: Risk Simulator */}
            <Card title="Risk Simulator (风控模拟)" icon={Zap}>
                <Row loading={!data} label="Google" value={<StatusBadge status={data?.riskScores?.google} />} />
                <Row loading={!data} label="Meta / FB" value={<StatusBadge status={data?.riskScores?.meta} />} />
                <Row loading={!data} label="TikTok" value={<StatusBadge status={data?.riskScores?.tiktok} />} />
                <Row loading={!data} label="Stripe" value={<StatusBadge status={data?.riskScores?.stripe} />} />
                <Row loading={!data} label="Cloudflare" value={<StatusBadge status={data?.riskScores?.cloudflare} />} />
            </Card>

            {/* SECTION: Modern Capabilities */}
            <Card title="Modern Capabilities & Media" icon={Video}>
                <Row loading={!data} label="Bluetooth" value={data?.data?.apis?.bluetooth ? 'Available' : 'Unsupported'} />
                <Row loading={!data} label="WebUSB" value={data?.data?.apis?.usb ? 'Available' : 'Unsupported'} />
                <Row loading={!data} label="Sensors" value={data?.data?.apis?.sensors ? 'Available' : 'Unsupported'} />
                <Row loading={!data} label="WebAssembly" value={data?.data?.apis?.webAssembly ? 'Supported' : 'Unsupported'} />
                <Row loading={!data} label="Clipboard" value={data?.data?.apis?.clipboard ? 'Supported' : 'Unsupported'} />
                <Row loading={!data} label="AdBlock" value={data?.data?.adblock?.detected ? 'Detected' : 'Not Detected'} />
                <div className="my-2 border-t border-slate-800"></div>
                <div className="grid grid-cols-3 gap-2">
                    {data?.data?.codecs && Object.entries(data.data.codecs).map(([k,v]) => (
                        <div key={k} className={`text-[10px] border px-1 py-0.5 rounded text-center uppercase ${v ? 'border-emerald-900 text-emerald-400 bg-emerald-900/20' : 'border-rose-900 text-rose-400 bg-rose-900/20 line-through'}`}>
                            {k}
                        </div>
                    ))}
                </div>
            </Card>

            {/* SECTION: Fingerprints */}
            <Card title="Fingerprints" icon={Fingerprint}>
                <Row loading={!data} label="Canvas" value={data?.data?.canvas?.hash} mono />
                <Row loading={!data} label="WebGL" value={data?.data?.webgl?.hash} mono />
                <Row loading={!data} label="Audio" value={data?.data?.audio?.hash} mono />
                <Row loading={!data} label="ClientRects" value={data?.data?.clientRects?.hash} mono />
                <Row loading={!data} label="Math" value={data?.data?.math?.hash} mono />
                <Row loading={!data} label="WebGPU" value={data?.data?.webgpu?.supported ? 'Supported' : 'Unsupported'} />
                <div className="my-2 border-t border-slate-800"></div>
                <div className="text-xs text-slate-500 mb-1">WebGL Vendor</div>
                <div className="text-xs text-slate-300">{data?.data?.webgl?.vendor || 'N/A'}</div>
                <div className="text-xs text-slate-500 mt-2 mb-1">WebGL Renderer</div>
                <div className="text-xs text-slate-300">{data?.data?.webgl?.renderer || 'N/A'}</div>
            </Card>

            {/* SECTION: Bot Detection */}
            <Card title="Bot Detection" icon={ShieldAlert}>
                 <Row loading={!data} label="Bot Detected" value={data?.data?.bot?.isBot ? 'Yes' : 'No'} 
                      error={data?.data?.bot?.isBot} highlight={!data?.data?.bot?.isBot} />
                 <Row loading={!data} label="WebDriver" value={data?.data?.bot?.details?.webdriver ? 'Present' : 'Missing'} 
                      error={data?.data?.bot?.details?.webdriver} highlight={!data?.data?.bot?.details?.webdriver} />
                 <Row loading={!data} label="Headless" value={data?.data?.bot?.details?.puppeteer ? 'Yes' : 'No'} 
                      error={data?.data?.bot?.details?.puppeteer} highlight={!data?.data?.bot?.details?.puppeteer} />
                 <Row loading={!data} label="Selenium" value={data?.data?.bot?.details?.selenium ? 'Detected' : 'Not Detected'} 
                      error={data?.data?.bot?.details?.selenium} highlight={!data?.data?.bot?.details?.selenium} />
                 <Row loading={!data} label="Dev Tools Open" value={data?.data?.bot?.details?.devToolsOpen ? 'Yes' : 'No'} 
                      warning={data?.data?.bot?.details?.devToolsOpen} />
                 <Row loading={!data} label="Navigator Props" value={data?.data?.bot?.details?.navigatorCount} />
                 <Row loading={!data} label="Mouse Entropy" value={data?.entropy != null ? `${data.entropy}%` : 'Calculating...'} 
                      warning={data?.entropy != null && data?.entropy < 30} />
            </Card>

             {/* SECTION: Fonts */}
             <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                <Card title={`System Fonts (${data?.data?.fonts?.length || 0})`} icon={Box}>
                     <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                        {!data ? (
                          <Skeleton className="h-4 w-full"/>
                        ) : data.data.fonts && data.data.fonts.length > 0 ? (
                          data.data.fonts.map((font: string) => (
                            <span key={font} className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-400">{font}</span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">No fonts detected</span>
                        )}
                     </div>
                </Card>
             </div>

      </main>
    </div>
  );
}
