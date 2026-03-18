'use client';

import { useState } from 'react';
import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const triggerSync = async () => {
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch('/api/clickup/sync/manual', { method: 'POST' });
      const data = await resp.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-4xl font-bold leading-tight tracking-tight text-black dark:text-zinc-50">
            Syncify Backend
          </h1>
          <p className="max-w-md text-lg leading-7 text-zinc-600 dark:text-zinc-400">
            ClickUp synchronization service deployed on Vercel. 
          </p>
          
          <div className="mt-8 flex flex-col items-center gap-4 sm:items-start">
            <button
              onClick={triggerSync}
              disabled={loading}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-8 text-white transition-all transform hover:scale-105 active:scale-95 dark:bg-white dark:text-black font-semibold md:w-auto shadow-lg disabled:opacity-50 disabled:scale-100`}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black" />
              ) : null}
              {loading ? 'Triggering Sync...' : 'Manual Sync Now'}
            </button>
            
            {result && (
              <div className={`mt-4 w-full p-4 rounded-xl border ${result.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'} animate-in fade-in slide-in-from-top-4`}>
                <p className="font-semibold">{result.message || (result.success ? 'Success' : 'Failed')}</p>
                {result.error && <p className="mt-1 text-sm opacity-80">{result.error}</p>}
                {result.data && result.success && (
                  <pre className="mt-2 text-xs overflow-auto max-h-32 p-2 bg-white/50 rounded-lg">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm font-medium sm:flex-row mt-12 opacity-60">
           <span>Endpoint: /api/clickup/sync/manual</span>
        </div>
      </main>
    </div>
  );
}
