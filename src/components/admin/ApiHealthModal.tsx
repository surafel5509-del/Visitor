import React, { useEffect, useState } from 'react';
import { X, Activity, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Key, Database, Zap, Flame, Clock } from 'lucide-react';
import { useVistora } from '../../context/VistoraContext';

interface HealthData {
  totalKeysConfigured: number;
  activeKeysCount: number;
  cooldownKeysCount: number;
  totalRequests: number;
  totalErrors: number;
  cacheHits: number;
  averageLatencyMs: number;
  totalSearchesLogged: number;
  collectionsCount: number;
  curatedMediaAvailable: number;
  status: string;
  activeTier?: string;
  recentRpsWindow?: number;
  tiers?: {
    tier1_primary?: { configured: number; active: number };
    tier2_burst?: { configured: number; active: number };
    tier3_emergency?: { configured: number; active: number };
  };
}

export const ApiHealthModal: React.FC = () => {
  const { isHealthModalOpen, setIsHealthModalOpen } = useVistora();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHealth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/health');
      const data = await res.json();
      if (data.success) {
        setHealth(data.data);
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isHealthModalOpen) {
      fetchHealth();
    }
  }, [isHealthModalOpen]);

  if (!isHealthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl overflow-hidden border border-[#EAEAEA] dark:border-[#2A2A2A] max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EAEAEA] dark:border-[#2A2A2A] shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#FFD21F]" />
            <div>
              <h3 className="font-display font-bold text-lg text-[#171717] dark:text-white leading-tight">
                VISTORA Multi-Tier Resilience Engine
              </h3>
              <p className="text-[11px] text-[#888888]">
                Intelligent traffic-scaling & emergency reserve architecture
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHealthModalOpen(false)}
            className="p-1.5 text-gray-400 hover:text-[#171717] dark:hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Active Tier Banner */}
          <div className="p-4 rounded-2xl bg-[#FFF4B8]/30 dark:bg-[#FFD21F]/10 border border-[#FFD21F]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FFD21F] animate-pulse" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#171717] dark:text-[#FFDF4D]">
                  {health?.activeTier || 'Tier 1: Primary Duo Active'}
                </p>
                <p className="text-[11px] text-[#666666] dark:text-gray-300">
                  Recent velocity: {health?.recentRpsWindow ?? 0} requests in last 60s
                </p>
              </div>
            </div>
            <button
              onClick={fetchHealth}
              disabled={isLoading}
              className="p-2 text-[#171717] dark:text-white hover:bg-[#FFD21F]/20 rounded-full transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* THREE-TIER VISUAL ARCHITECTURE */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#888888]">
              Automated Dynamic Scaling Tiers
            </h4>

            {/* Tier 1 */}
            <div className="p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202020] border border-[#EBEBEB] dark:border-[#2C2C2C] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF4B8] dark:bg-[#FFD21F]/20 flex items-center justify-center font-black text-xs text-[#171717] dark:text-[#FFD21F]">
                  T1
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-white">
                    Tier 1: Primary Duo (Keys 1 & 2)
                  </p>
                  <p className="text-[10px] text-[#666666] dark:text-gray-400">
                    Baseline balanced active rotation. If one throttles, the other seamlessly assumes traffic.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300">
                {health?.tiers?.tier1_primary?.active ?? 2} / {health?.tiers?.tier1_primary?.configured ?? 2} Ready
              </span>
            </div>

            {/* Tier 2 */}
            <div className="p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202020] border border-[#EBEBEB] dark:border-[#2C2C2C] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 font-bold text-xs">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-white">
                    Tier 2: Dynamic Burst Scalers (Keys 3 & 4)
                  </p>
                  <p className="text-[10px] text-[#666666] dark:text-gray-400">
                    Spins up automatically when concurrency surges or primary keys encounter load limits.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                {health?.tiers?.tier2_burst?.active ?? 0} Active (Standby Ready)
              </span>
            </div>

            {/* Tier 3 */}
            <div className="p-3.5 rounded-2xl bg-[#F9F9F9] dark:bg-[#202020] border border-[#EBEBEB] dark:border-[#2C2C2C] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center text-[#FFD21F] font-bold text-xs">
                  <Zap className="w-4 h-4 fill-[#FFD21F]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-white">
                    Tier 3: Emergency Hot-Standby (Key 5)
                  </p>
                  <p className="text-[10px] text-[#666666] dark:text-gray-400">
                    Guaranteed lightning-speed emergency reserve that triggers instantly if primary & burst keys exhaust.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF4B8] dark:bg-[#FFD21F]/20 text-[#171717] dark:text-[#FFD21F]">
                Instant Standby
              </span>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#222222] text-center">
              <span className="text-[10px] uppercase font-bold text-[#888888] block">Total Requests</span>
              <span className="text-lg font-black text-[#171717] dark:text-white">
                {health?.totalRequests ?? 0}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#222222] text-center">
              <span className="text-[10px] uppercase font-bold text-[#888888] block">Cache Hits</span>
              <span className="text-lg font-black text-[#171717] dark:text-white">
                {health?.cacheHits ?? 0}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F5F5F5] dark:bg-[#222222] text-center">
              <span className="text-[10px] uppercase font-bold text-[#888888] block">Avg Latency</span>
              <span className="text-lg font-black text-[#171717] dark:text-white">
                {health?.averageLatencyMs ?? 0} ms
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
