'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cooldown, setCooldown] = useState(0);
  const [quotaRemaining, setQuotaRemaining] = useState(2);
  const WINDOW_MS = 24 * 60 * 60 * 1000;
  const GAP_MS = 60 * 60 * 1000; // 1 hour gap

  const [isMounted, setIsMounted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Manage 24h Quota and Cooldown
  useEffect(() => {
    if (!isMounted) return;
    const checkQuota = () => {
      const historyStr = localStorage.getItem('sync_history_v3') || '[]';
      let history: number[] = JSON.parse(historyStr);
      const now = Date.now();

      // Filter the last 24h
      history = history.filter(ts => now - ts < WINDOW_MS);
      localStorage.setItem('sync_history_v3', JSON.stringify(history));

      setQuotaRemaining(2 - history.length);

      let nextAvailableMs = 0;

      // Rule 1: Max 2 syncs in 24 hours
      if (history.length >= 2) {
        const oldestSync = Math.min(...history);
        nextAvailableMs = WINDOW_MS - (now - oldestSync);
      }

      // Rule 2: 1 hour gap between any sync
      if (history.length > 0) {
        const lastSync = Math.max(...history);
        const gapMs = GAP_MS - (now - lastSync);
        if (gapMs > nextAvailableMs) {
          nextAvailableMs = gapMs;
        }
      }

      setCooldown(Math.max(0, Math.ceil(nextAvailableMs / 1000)));
    };

    checkQuota();
    const timer = setInterval(checkQuota, 1000);
    return () => clearInterval(timer);
  }, [isMounted]);

  const triggerSync = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch('/api/clickup/sync/manual', { method: 'POST' });
      const data = await resp.json();
      setResult(data);

      if (resp.ok) {
        const historyStr = localStorage.getItem('sync_history_v3') || '[]';
        const history: number[] = JSON.parse(historyStr);
        history.push(Date.now());
        localStorage.setItem('sync_history_v3', JSON.stringify(history));
      }
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-background font-mono selection:bg-accent/30 overflow-hidden">
      {/* HUD Frame Border */}
      <div className="hud-frame">
        <div className="hud-corner hud-corner-tl" />
        <div className="hud-corner hud-corner-tr" />
        <div className="hud-corner hud-corner-bl" />
        <div className="hud-corner hud-corner-br" />
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <main className="relative z-10 w-full max-w-xl flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gradient-modern mb-3">
            SYNCIFY
          </h1>
          <p className="text-[12px] uppercase tracking-[0.4em] text-white/40 font-bold">
            Data Bridge Protocol <span className="text-accent">Stable</span>
          </p>
        </div>

        {/* Interactive Quota & Protocol Box */}
        <div
          className="w-full group/quota relative mb-6 cursor-help"
          onMouseEnter={() => setShowDetails(true)}
          onMouseLeave={() => setShowDetails(false)}
          onClick={() => setShowDetails(!showDetails)}
        >
          {/* Main Monitor Box */}
          <div className="w-full glass-card rounded-3xl p-6 transition-all duration-500 group-hover/quota:shadow-[0_0_40px_rgba(0,255,65,0.05)] relative z-20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Session Quota</span>
                <span className="text-2xl font-bold">{quotaRemaining} <span className="text-white/20">/ 2</span></span>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 transition-transform duration-500 group-hover/quota:rotate-90">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full premium-button transition-all duration-1000"
                  style={{ width: `${(quotaRemaining / 2) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] tracking-wider font-bold">
                <span className="text-white/20 uppercase group-hover/quota:text-accent/50 transition-colors">
                  {showDetails ? 'Protocol Active' : 'Interacting for Details'}
                </span>
                {cooldown > 0 && (
                  <span className="text-accent">{formatTime(cooldown)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Hidden Protocol Details (reveals on hover/tap) */}
          <div className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${showDetails ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="glass-card rounded-2xl p-6 border-accent/10">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Daily Limit</span>
                  <p className="text-xs font-bold text-white/80">Max <span className="text-accent">2 Syncs</span> / 24H</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-[9px] text-white/30 uppercase tracking-widest block mb-1">Sequence Gap</span>
                  <p className="text-xs font-bold text-white/80">Min <span className="text-accent">1 Hour</span> Gap</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-white/20 italic">
                <div className="w-1 h-1 rounded-full bg-accent/30" />
                Stability verification protocol engaged.
              </div>
            </div>
          </div>
        </div>

        {/* Action Console */}
        <div className="w-full glass-card rounded-3xl p-8 mb-8 animate-in zoom-in-95 duration-700 delay-400">
          <div className="flex flex-col gap-10">
            {/* Primary Action Box */}
            <div className={`p-1.5 rounded-[22px] border ${cooldown > 0 ? 'border-white/5 opacity-80' : 'border-[#00ff41]/30 bg-[#00ff41]/5 shadow-[0_0_30px_rgba(0,255,65,0.1)]'} transition-all duration-500`}>
              <div className="relative group">
                <button
                  onClick={triggerSync}
                  disabled={loading || cooldown > 0}
                  className={`w-full h-20 rounded-2xl font-black text-xl tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-4 ${loading || cooldown > 0
                      ? 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'
                      : 'premium-button text-black hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Synchronizing</span>
                    </div>
                  ) : cooldown > 0 ? (
                    <span>Recharging</span>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                      <span>Sync Now</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Results Log Section */}
            <div className="w-full min-h-[120px]">
              {result ? (
                <div className={`p-6 rounded-2xl border ${result.success ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'} animate-in slide-in-from-bottom-2 duration-500`}>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-3 opacity-60">
                    <div className={`w-1.5 h-1.5 rounded-full ${result.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {result.success ? 'Sync Success' : 'Sync Failed'}
                  </div>
                  <div className="text-[12px] leading-relaxed text-white/70 italic custom-scrollbar overflow-auto max-h-32">
                    {result.success ? (
                      <div className="space-y-1">
                        <p className="animate-in fade-in duration-300">Verification complete. Data packets pushed.</p>
                        <p className="animate-in fade-in delay-200 duration-300">Timetracker nodes updated via clickup_api.</p>
                      </div>
                    ) : (
                      <p className="text-rose-400 font-bold">{result.error}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-4">
                  <p className="text-[10px] uppercase tracking-[0.5em] mb-4">Awaiting Signal</p>
                  <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Telemetry */}
        <div className="w-full flex justify-between items-center text-[10px] tracking-[0.2em] font-bold text-white/20 animate-in fade-in duration-1000 delay-700">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-accent" />
              MEM_SYNCED
            </span>
            <span className="hidden md:block">|</span>
            <span>U_TIME: 100%</span>
          </div>
          <span className="opacity-40">V2.5.0-STABLE</span>
        </div>
      </main>
    </div>
  );
}
