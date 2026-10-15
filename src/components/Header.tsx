import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Activity, HelpCircle, Info, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { SeverityLevel } from '../types/trishield';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  severity: SeverityLevel;
  riskScore: number;
  readingsCount: number;
  alertCount: number;
  reportCount: number;
  isChainValid: boolean;
  showSimulatedWatermark: boolean;
  onOpenHowItWorks: () => void;
  onOpenRealVsSim: () => void;
  onRunGuidedDemo: () => void;
  isDemoRunning: boolean;
  demoStepName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  severity,
  riskScore,
  readingsCount,
  alertCount,
  reportCount,
  isChainValid,
  showSimulatedWatermark,
  onOpenHowItWorks,
  onOpenRealVsSim,
  onRunGuidedDemo,
  isDemoRunning,
  demoStepName
}) => {
  const tabs = [
    { id: 'dashboard', label: '1. Live Dashboard', icon: Activity },
    { id: 'simulator', label: '2. Attack Simulator', icon: Play },
    { id: 'evidence', label: '3. Evidence Log', icon: isChainValid ? ShieldCheck : ShieldAlert },
    { id: 'reports', label: '4. Forensic Reports', icon: Shield },
    { id: 'settings', label: '5. Engine Settings', icon: HelpCircle }
  ];

  // Status banner configuration
  const bannerConfig = {
    SAFE: {
      bg: 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]',
      dot: 'bg-[#22C55E]',
      label: 'NETWORK STATE: SECURE',
      sub: 'All connected base stations verified against cryptographic baselines. Strong 4G/LTE encryption active.'
    },
    CAUTION: {
      bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]',
      dot: 'bg-[#F59E0B]',
      label: 'NETWORK STATE: SUSPICIOUS ANOMALY',
      sub: 'RF power or timing advance variance detected. Isolation Forest elevated above normal baseline.'
    },
    DANGER: {
      bg: 'bg-[#EF4444]/15 border-[#EF4444]/50 text-[#EF4444]',
      dot: 'bg-[#EF4444] animate-ping',
      label: 'NETWORK STATE: ROGUE CELL TOWER ACTIVE (IMSI CATCHER DETECTED)',
      sub: 'CRITICAL THREAT: Forced cipher downgrade or high-gain broadcast hijack in progress. Plaintext interception risk.'
    }
  }[severity];

  return (
    <header className="sticky top-0 z-40 bg-[#0E1117] border-b border-[#21262D]">
      {/* 1. Persistent Status Banner */}
      <div className={`px-4 py-2 border-b transition-colors duration-300 flex items-center justify-between ${bannerConfig.bg}`}>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className={`w-3 h-3 rounded-full ${severity === 'DANGER' ? 'bg-[#EF4444]' : bannerConfig.dot}`} />
            {severity === 'DANGER' && (
              <span className="absolute w-3 h-3 rounded-full bg-[#EF4444] animate-ping opacity-75" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold tracking-wider">{bannerConfig.label}</span>
            <span className="text-xs text-[#E6EDF3] hidden md:inline">({bannerConfig.sub})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-[#8B949E]">Current Risk:</span>
            <span className={`font-bold px-1.5 py-0.5 rounded text-xs ${
              severity === 'DANGER' ? 'bg-[#EF4444]/20 text-[#EF4444]' :
              severity === 'CAUTION' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
              'bg-[#22C55E]/20 text-[#22C55E]'
            }`}>
              {riskScore}/100
            </span>
          </div>

          {showSimulatedWatermark && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D] hidden sm:inline-block">
              SIMULATED — NO RF TRANSMITTED
            </span>
          )}
        </div>
      </div>

      {/* 2. Brand & Global Operations Bar */}
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1F6FEB]/20 border border-[#1F6FEB]/40 flex items-center justify-center text-[#1F6FEB]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-[#F0F6FC]">
                TriShield <span className="text-[#1F6FEB] font-mono text-sm font-semibold">SOC</span>
              </h1>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#21262D] text-[#8B949E]">
                v2.4
              </span>
            </div>
            <p className="text-xs text-[#8B949E]">
              Three-Layer Rogue Cell Tower &amp; IMSI Catcher Interception Defense
            </p>
          </div>
        </div>

        {/* System Health Summary for Judges */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#21262D]">
            <div>
              <span className="text-[#8B949E] block text-[10px] uppercase font-mono">Telemetry</span>
              <span className="font-mono font-semibold text-[#F0F6FC]">{readingsCount} frames</span>
            </div>
            <div className="w-px h-6 bg-[#21262D]" />
            <div>
              <span className="text-[#8B949E] block text-[10px] uppercase font-mono">Alerts</span>
              <span className={`font-mono font-semibold ${alertCount > 0 ? 'text-[#EF4444]' : 'text-[#8B949E]'}`}>
                {alertCount} active
              </span>
            </div>
            <div className="w-px h-6 bg-[#21262D]" />
            <div>
              <span className="text-[#8B949E] block text-[10px] uppercase font-mono">Report Ready</span>
              <span className={`font-mono font-semibold ${reportCount > 0 ? 'text-[#F59E0B]' : 'text-[#8B949E]'}`}>
                {reportCount} cases
              </span>
            </div>
            <div className="w-px h-6 bg-[#21262D]" />
            <div>
              <span className="text-[#8B949E] block text-[10px] uppercase font-mono">SHA-256 Ledger</span>
              <span className={`font-mono font-semibold flex items-center gap-1 ${isChainValid ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {isChainValid ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {isChainValid ? 'VERIFIED' : 'TAMPERED'}
              </span>
            </div>
          </div>

          {/* Quick Explainer Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHowItWorks}
              className="px-2.5 py-1.5 rounded-md bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-[#E6EDF3] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="4-step pipeline explanation"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#1F6FEB]" />
              <span>How this works</span>
            </button>

            <button
              onClick={onOpenRealVsSim}
              className="px-2.5 py-1.5 rounded-md bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-[#E6EDF3] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="What is real vs simulated in this demo"
            >
              <Info className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Real vs. Simulated</span>
            </button>

            {/* Guided Demo Button */}
            <button
              onClick={onRunGuidedDemo}
              disabled={isDemoRunning}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDemoRunning
                  ? 'bg-[#1F6FEB]/50 text-white cursor-wait'
                  : 'bg-[#1F6FEB] hover:bg-[#388BFD] text-white shadow-sm hover:shadow-[#1F6FEB]/30'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isDemoRunning ? (demoStepName || 'Running Demo...') : 'Run Full Demo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigation with persistent active indicator */}
      <nav className="px-6 flex space-x-1 border-t border-[#21262D] overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-4 py-3 text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#F0F6FC] font-semibold'
                  : 'text-[#8B949E] hover:text-[#C9D1D9]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#1F6FEB]' : 'text-[#8B949E]'}`} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F6FEB] shadow-[0_0_8px_#1F6FEB]" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
