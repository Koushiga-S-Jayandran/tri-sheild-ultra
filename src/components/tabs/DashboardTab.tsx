import React, { useState, useEffect } from 'react';
import { 
  Radio, Shield, ShieldAlert, ShieldCheck, Zap, RefreshCw, 
  Eye, EyeOff, Clock, Sliders, AlertTriangle, ArrowRight,
  Wifi, Lock, Unlock, Compass
} from 'lucide-react';
import { CellularReading, DetectionResult } from '../../types/trishield';
import { TermTooltip } from '../TermTooltip';

interface DashboardTabProps {
  currentReading: CellularReading;
  currentDetection: DetectionResult;
  history: { timestamp: string; score: number; label: string }[];
  activeScenarioId: string;
  exposureSeconds: number;
  userThreshold: number;
  onThresholdChange: (val: number) => void;
  onServingTowerChange: (towerKey: 'home' | 'office' | 'rogue') => void;
  onResetToNormal: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  currentReading,
  currentDetection,
  history,
  activeScenarioId,
  exposureSeconds,
  userThreshold,
  onThresholdChange,
  onServingTowerChange,
  onResetToNormal
}) => {
  const [splitViewMode, setSplitViewMode] = useState<'with_trishield' | 'without_trishield'>('with_trishield');
  const [pulseKey, setPulseKey] = useState<number>(0);

  // Trigger telemetry pulse when reading updates
  useEffect(() => {
    setPulseKey(prev => prev + 1);
  }, [currentReading.id, currentReading.rssi, currentReading.encryption]);

  const isRogueActive = currentDetection.severity === 'DANGER';

  // Tower coordinate visual mapping
  const towers = [
    {
      id: 'home',
      name: 'Airtel Macro #18402 (Home Zone)',
      lac: 40221,
      cellId: 18402,
      x: 180,
      y: 220,
      risk: 10,
      type: 'legit'
    },
    {
      id: 'office',
      name: 'Connaught Macro #19201 (Office Zone)',
      lac: 40222,
      cellId: 19201,
      x: 480,
      y: 110,
      risk: 12,
      type: 'legit'
    },
    {
      id: 'rogue',
      name: currentReading.cellId === 65534 || currentReading.cellId === 65530 
        ? currentReading.towerLabel 
        : 'Rogue StingRay / IMSI Catcher (Simulated)',
      lac: currentReading.lac,
      cellId: currentReading.cellId,
      x: 320,
      y: 180,
      risk: isRogueActive ? currentDetection.riskScore : 0,
      type: 'rogue'
    }
  ];

  // Gauge calculation
  const gaugeAngle = -120 + (currentDetection.riskScore / 100) * 240; // -120 to +120 deg

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Controls: Split View & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#161B22] border border-[#21262D]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8B949E]">View Perspective:</span>
          <div className="flex items-center bg-[#0E1117] p-1 rounded-lg border border-[#30363D]">
            <button
              onClick={() => setSplitViewMode('without_trishield')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                splitViewMode === 'without_trishield'
                  ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-semibold'
                  : 'text-[#8B949E] hover:text-[#F0F6FC]'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Without TriShield (Victim Phone)</span>
            </button>
            <button
              onClick={() => setSplitViewMode('with_trishield')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                splitViewMode === 'with_trishield'
                  ? 'bg-[#1F6FEB] text-white shadow-sm font-semibold'
                  : 'text-[#8B949E] hover:text-[#F0F6FC]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>With TriShield (Full SOC Radar)</span>
            </button>
          </div>
        </div>

        {/* Attack Exposure Timer (Active only during attack) */}
        {isRogueActive && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 animate-pulse">
            <Clock className="w-4 h-4 text-[#EF4444]" />
            <div className="text-xs">
              <span className="text-[#8B949E] block text-[10px] uppercase font-mono">Unprotected Exposure Window</span>
              <span className="font-mono font-bold text-[#EF4444]">
                {Math.floor(exposureSeconds / 60).toString().padStart(2, '0')}:{(exposureSeconds % 60).toString().padStart(2, '0')} active
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={onResetToNormal}
            className="px-3 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] text-xs font-medium rounded-lg border border-[#30363D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Reset to Normal Baseline</span>
          </button>
        </div>
      </div>

      {/* PERSPECTIVE A: WITHOUT TRISHIELD (VICTIM PHONE SCREEN SIMULATION) */}
      {splitViewMode === 'without_trishield' ? (
        <div className="soc-card p-8 border-[#30363D] bg-gradient-to-b from-[#161B22] to-[#0E1117]">
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-[#090D13] border-4 border-[#30363D] shadow-2xl space-y-6">
            {/* Phone Status Bar */}
            <div className="flex items-center justify-between text-xs text-[#8B949E] border-b border-[#21262D] pb-3">
              <span className="font-mono">10:42 PM</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">4G LTE / GSM</span>
                <span className="text-[#22C55E]">●●●●○</span>
                <Wifi className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Victim unaware state */}
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#21262D] flex items-center justify-center mx-auto text-[#22C55E]">
                <Radio className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Carrier Signal: Full Strength</h3>
              <p className="text-xs text-[#8B949E] px-4">
                Your standard phone operating system simply displays standard signal bars. It provides zero indication that the base station has stripped encryption or forced you into plaintext mode.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#E6EDF3] space-y-2">
              <div className="flex items-center gap-2 text-[#EF4444] font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>What Is Happening Behind the Scenes:</span>
              </div>
              <ul className="text-[11px] text-[#8B949E] space-y-1 list-disc list-inside">
                <li>IMSI Catcher forced connection to rogue transmitter</li>
                <li>Cipher mode forced to <span className="font-mono text-[#EF4444]">A5/0 (No Encryption)</span></li>
                <li>All outgoing calls, SMS OTPs, and location are currently intercepted</li>
                <li>Stock iOS / Android gives zero warnings to the victim</li>
              </ul>
            </div>

            <button
              onClick={() => setSplitViewMode('with_trishield')}
              className="w-full py-2.5 bg-[#1F6FEB] hover:bg-[#388BFD] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Switch to TriShield Detection Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* PERSPECTIVE B: WITH TRISHIELD (FULL SOC RADAR) */
        <>
          {/* Live Telemetry Strip: 4 Metric Cards with pulse animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Signal Power */}
            <div 
              key={`metric-rssi-${pulseKey}`}
              className="soc-card p-4 transition-all duration-300"
            >
              <div className="flex items-center justify-between text-xs text-[#8B949E] mb-1">
                <span className="font-medium">Signal Power</span>
                <TermTooltip termKey="rssi">RSSI</TermTooltip>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-mono ${
                  currentReading.rssi > -55 ? 'text-[#EF4444]' : 'text-[#F0F6FC]'
                }`}>
                  {currentReading.rssi} <span className="text-xs font-normal text-[#8B949E]">dBm</span>
                </span>
                {currentReading.rssi > -55 && (
                  <span className="text-[10px] font-mono text-[#EF4444] bg-[#EF4444]/15 px-1.5 py-0.5 rounded">
                    OVERPOWERED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8B949E] mt-2 border-t border-[#21262D] pt-1.5">
                {currentReading.rssi > -55 
                  ? 'Abnormally strong RF power: typical rogue cell takeover signature.' 
                  : 'Signal within normal cellular baseline propagation parameters.'}
              </p>
            </div>

            {/* Card 2: Ciphering Algorithm */}
            <div 
              key={`metric-enc-${pulseKey}`}
              className="soc-card p-4 transition-all duration-300"
            >
              <div className="flex items-center justify-between text-xs text-[#8B949E] mb-1">
                <span className="font-medium">Encryption Mode</span>
                <TermTooltip termKey="a50">Cipher</TermTooltip>
              </div>
              <div className="flex items-baseline gap-2">
                {currentReading.encryption.includes('A5/0') ? (
                  <div className="flex items-center gap-1.5 text-[#EF4444] font-mono text-sm font-bold">
                    <Unlock className="w-4 h-4 shrink-0" />
                    <span>A5/0 NULL (NONE)</span>
                  </div>
                ) : currentReading.encryption.includes('A5/1') ? (
                  <div className="flex items-center gap-1.5 text-[#F59E0B] font-mono text-sm font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>A5/1 (WEAK 2G)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[#22C55E] font-mono text-sm font-bold">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>EEA2 (AES-128)</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-[#8B949E] mt-2 border-t border-[#21262D] pt-1.5">
                {currentReading.encryption.includes('A5/0')
                  ? 'CRITICAL: Cell forced plaintext. Eavesdropping vulnerability active.'
                  : currentReading.encryption.includes('A5/1')
                  ? 'Weak legacy 2G encryption. Susceptible to real-time cracking.'
                  : 'Strong modern mutual authentication active.'}
              </p>
            </div>

            {/* Card 3: Cell ID & Neighbor Topology */}
            <div 
              key={`metric-cell-${pulseKey}`}
              className="soc-card p-4 transition-all duration-300"
            >
              <div className="flex items-center justify-between text-xs text-[#8B949E] mb-1">
                <span className="font-medium">Neighbor Topology</span>
                <TermTooltip termKey="lac">LAC &amp; Cell</TermTooltip>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-[#F0F6FC]">
                  {currentReading.neighborCount} <span className="text-xs font-normal text-[#8B949E]">adjacent</span>
                </span>
                {currentReading.neighborCount === 0 && (
                  <span className="text-[10px] font-mono text-[#EF4444] bg-[#EF4444]/15 px-1.5 py-0.5 rounded">
                    SUPPRESSED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8B949E] mt-2 border-t border-[#21262D] pt-1.5">
                {currentReading.neighborCount === 0
                  ? 'Zero neighbors broadcasted: handset trapped on current tower.'
                  : 'Valid carrier multi-cell handoff topology broadcasted.'}
              </p>
            </div>

            {/* Card 4: Fused Threat Score */}
            <div 
              key={`metric-score-${pulseKey}`}
              className="soc-card p-4 transition-all duration-300"
            >
              <div className="flex items-center justify-between text-xs text-[#8B949E] mb-1">
                <span className="font-medium">Threat Assessment</span>
                <TermTooltip termKey="isolation_forest">AI Fusion</TermTooltip>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold font-mono ${
                  currentDetection.riskScore >= userThreshold ? 'text-[#EF4444]' :
                  currentDetection.riskScore >= 35 ? 'text-[#F59E0B]' :
                  'text-[#22C55E]'
                }`}>
                  {currentDetection.riskScore}<span className="text-xs font-normal text-[#8B949E]">/100</span>
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  currentDetection.riskScore >= userThreshold ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                  currentDetection.riskScore >= 35 ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                  'bg-[#22C55E]/20 text-[#22C55E]'
                }`}>
                  {currentDetection.severity}
                </span>
              </div>
              <p className="text-[11px] text-[#8B949E] mt-2 border-t border-[#21262D] pt-1.5">
                {currentDetection.riskScore >= userThreshold
                  ? 'Above alert threshold. Automatic cryptographic sealing triggered.'
                  : 'Below alert threshold. Connection considered secure.'}
              </p>
            </div>
          </div>

          {/* Middle Row: GIS Tower Map & Risk Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Map Column (7 cols) */}
            <div className="lg:col-span-7 soc-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#1F6FEB]" />
                    <h3 className="text-sm font-semibold text-[#F0F6FC]">Geospatial RF Triangulation Map</h3>
                  </div>

                  {/* Serving Tower Selector */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#8B949E] text-[11px]">Serving Cell:</span>
                    <select
                      value={
                        currentReading.cellId === 18402 ? 'home' :
                        currentReading.cellId === 19201 ? 'office' : 'rogue'
                      }
                      onChange={(e) => onServingTowerChange(e.target.value as any)}
                      className="bg-[#0E1117] border border-[#30363D] text-[#E6EDF3] text-xs rounded px-2 py-1 font-mono cursor-pointer focus:border-[#1F6FEB]"
                    >
                      <option value="home">Home Macro #18402 (Legitimate)</option>
                      <option value="office">Office Macro #19201 (Legitimate)</option>
                      <option value="rogue">Rogue Tower / StingRay (Simulated)</option>
                    </select>
                  </div>
                </div>

                {/* SVG RF Environment Map */}
                <div className="relative w-full h-72 bg-[#090D13] rounded-lg border border-[#21262D] overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 600 300">
                    {/* Grid Pattern */}
                    <defs>
                      <pattern id="socGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#socGrid)" />

                    {/* Urban sectors and streets */}
                    <line x1="80" y1="40" x2="520" y2="260" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="120" y1="260" x2="480" y2="40" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="4 4" />
                    
                    {/* Tower Broadcast Rings */}
                    {/* Home Tower */}
                    <circle cx="180" cy="220" r="75" fill="rgba(34, 197, 94, 0.04)" stroke="#22C55E" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Office Tower */}
                    <circle cx="480" cy="110" r="70" fill="rgba(34, 197, 94, 0.04)" stroke="#22C55E" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Rogue Tower (Pulsing Red) */}
                    {isRogueActive && (
                      <>
                        <circle cx="320" cy="180" r="95" fill="rgba(239, 68, 68, 0.08)" stroke="#EF4444" strokeWidth="1.5" className="animate-pulse" />
                        <circle cx="320" cy="180" r="130" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="1" strokeDasharray="4 4" className="animate-radar origin-center" />
                      </>
                    )}

                    {/* Handset position vector */}
                    <line 
                      x1={currentReading.cellId === 18402 ? 180 : currentReading.cellId === 19201 ? 480 : 320} 
                      y1={currentReading.cellId === 18402 ? 220 : currentReading.cellId === 19201 ? 110 : 180} 
                      x2="280" 
                      y2="190" 
                      stroke={isRogueActive ? "#EF4444" : "#1F6FEB"} 
                      strokeWidth="2" 
                      strokeDasharray="2 2"
                    />

                    {/* Tower Markers */}
                    {towers.map((tower) => {
                      const isConnected = 
                        (tower.id === 'home' && currentReading.cellId === 18402) ||
                        (tower.id === 'office' && currentReading.cellId === 19201) ||
                        (tower.id === 'rogue' && currentReading.cellId !== 18402 && currentReading.cellId !== 19201);
                      const isRogue = tower.type === 'rogue';

                      return (
                        <g key={tower.id} className="cursor-pointer" onClick={() => onServingTowerChange(tower.id as any)}>
                          {/* Tower Icon Base */}
                          <circle
                            cx={tower.x}
                            cy={tower.y}
                            r={isConnected ? "10" : "8"}
                            fill={isRogue && isRogueActive ? "#EF4444" : isRogue ? "#484F58" : "#22C55E"}
                            stroke="#0E1117"
                            strokeWidth="2"
                          />
                          {isConnected && (
                            <circle
                              cx={tower.x}
                              cy={tower.y}
                              r="15"
                              fill="none"
                              stroke={isRogue && isRogueActive ? "#EF4444" : "#1F6FEB"}
                              strokeWidth="1.5"
                            />
                          )}
                          <text
                            x={tower.x}
                            y={tower.y - 14}
                            textAnchor="middle"
                            fill={isRogue && isRogueActive ? "#EF4444" : "#8B949E"}
                            fontSize="10"
                            fontFamily="JetBrains Mono"
                            fontWeight="600"
                          >
                            {tower.name.split(' ')[0]} {isRogue ? '⚠️ ROGUE' : '✓ OK'}
                          </text>
                        </g>
                      );
                    })}

                    {/* Victim Mobile Handset Marker */}
                    <g transform="translate(280, 190)">
                      <circle cx="0" cy="0" r="6" fill="#1F6FEB" stroke="#FFFFFF" strokeWidth="2" />
                      <text x="10" y="4" fill="#F0F6FC" fontSize="10" fontFamily="Inter" fontWeight="bold">
                        Target UE ({currentReading.deviceId})
                      </text>
                    </g>
                  </svg>

                  {/* Overlay legend */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-3 px-2 py-1 rounded bg-[#0E1117]/80 text-[10px] text-[#8B949E] border border-[#21262D]">
                    <span className="flex items-center gap-1 font-mono"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Authentic Macro</span>
                    <span className="flex items-center gap-1 font-mono"><span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Rogue IMSI Catcher</span>
                    <span className="flex items-center gap-1 font-mono"><span className="w-2 h-2 rounded-full bg-[#1F6FEB]" /> Device Link</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#8B949E] mt-3">
                Live spatial map tracks cell broadcast radiuses and handoff vectors. Red pulsing highlights high-risk unregistered cells broadcasting overpowering signal strengths.
              </p>
            </div>

            {/* Gauge Column (5 cols) */}
            <div className="lg:col-span-5 soc-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#1F6FEB]" />
                    <h3 className="text-sm font-semibold text-[#F0F6FC]">Comprehensive Threat Gauge</h3>
                  </div>
                  <TermTooltip termKey="isolation_forest">Scoring Engine</TermTooltip>
                </div>

                {/* Plotly-styled SVG Gauge */}
                <div className="relative w-full h-48 flex items-center justify-center">
                  <svg className="w-64 h-44" viewBox="0 0 200 140">
                    {/* Gauge Arc Backgrounds */}
                    {/* Safe Arc (Green: 0-35) */}
                    <path
                      d="M 25 120 A 75 75 0 0 1 70 50"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="14"
                      strokeLinecap="round"
                      opacity="0.3"
                    />
                    {/* Caution Arc (Amber: 35-65) */}
                    <path
                      d="M 74 46 A 75 75 0 0 1 126 46"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="14"
                      opacity="0.3"
                    />
                    {/* Danger Arc (Red: 65-100) */}
                    <path
                      d="M 130 50 A 75 75 0 0 1 175 120"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="14"
                      strokeLinecap="round"
                      opacity="0.3"
                    />

                    {/* Active Track Highlight */}
                    <circle
                      cx="100"
                      cy="120"
                      r="75"
                      fill="none"
                      stroke={
                        currentDetection.riskScore >= userThreshold ? '#EF4444' :
                        currentDetection.riskScore >= 35 ? '#F59E0B' : '#22C55E'
                      }
                      strokeWidth="4"
                      strokeDasharray="471"
                      strokeDashoffset={471 - (currentDetection.riskScore / 100) * 235}
                      transform="rotate(180 100 120)"
                    />

                    {/* Needle */}
                    <g transform={`rotate(${gaugeAngle} 100 120)`} className="transition-transform duration-500 ease-out">
                      <line x1="100" y1="120" x2="100" y2="52" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="100" cy="120" r="7" fill="#1F6FEB" stroke="#FFFFFF" strokeWidth="2" />
                    </g>

                    {/* Scale labels */}
                    <text x="25" y="135" fill="#8B949E" fontSize="9" fontFamily="JetBrains Mono">0</text>
                    <text x="94" y="32" fill="#8B949E" fontSize="9" fontFamily="JetBrains Mono">50</text>
                    <text x="165" y="135" fill="#8B949E" fontSize="9" fontFamily="JetBrains Mono">100</text>
                  </svg>

                  {/* Centered Big Value Display */}
                  <div className="absolute bottom-2 text-center">
                    <span className={`text-4xl font-extrabold font-mono tracking-tight ${
                      currentDetection.riskScore >= userThreshold ? 'text-[#EF4444]' :
                      currentDetection.riskScore >= 35 ? 'text-[#F59E0B]' : 'text-[#22C55E]'
                    }`}>
                      {currentDetection.riskScore}
                    </span>
                    <span className="text-xs font-mono text-[#8B949E] block -mt-1">THREAT INDEX / 100</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0E1117] border border-[#21262D] text-center">
                  <span className="text-xs font-semibold text-[#F0F6FC] block">{currentDetection.summaryHeadline}</span>
                  <p className="text-[11px] text-[#8B949E] mt-0.5 line-clamp-2">{currentDetection.plainEnglishReason}</p>
                </div>
              </div>

              {/* Required Plain-English caption under risk gauge */}
              <p className="text-[11px] text-[#8B949E] mt-3 border-t border-[#21262D] pt-2">
                0 = normal network behavior. 100 = strong evidence of a rogue tower. Values over {userThreshold} automatically flag for evidence logging.
              </p>
            </div>
          </div>

          {/* Bottom Row: Reason Breakdown Bar Chart + Confidence Trend + Interactive Threshold Slider */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Reason Contribution Horizontal Stacked Bar (6 cols) */}
            <div className="lg:col-span-6 soc-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-sm font-semibold text-[#F0F6FC]">Threat Vector Indicator Contribution</h3>
                </div>
                <span className="text-xs font-mono text-[#8B949E]">
                  Rules: {currentDetection.ruleScore} pts | ML: {currentDetection.isolationForestScore} pts
                </span>
              </div>

              {/* Horizontal Bar Breakdown */}
              <div className="space-y-3">
                {currentDetection.ruleContributions.map((rule) => {
                  const pct = Math.min(100, (rule.points / rule.maxPoints) * 100);
                  return (
                    <div key={rule.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${rule.triggered ? 'text-[#F0F6FC]' : 'text-[#8B949E]'}`}>
                          {rule.name}
                        </span>
                        <span className={`font-mono text-xs ${rule.triggered ? 'text-[#EF4444] font-bold' : 'text-[#8B949E]'}`}>
                          +{rule.points} / {rule.maxPoints} pts
                        </span>
                      </div>
                      <div className="w-full h-2 rounded bg-[#0E1117] overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-500 ${
                            rule.points > 15 ? 'bg-[#EF4444]' :
                            rule.points > 0 ? 'bg-[#F59E0B]' : 'bg-[#22C55E]/30'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[#8B949E]">{rule.explanation}</p>
                    </div>
                  );
                })}

                {/* Isolation Forest row */}
                <div className="space-y-1 pt-1 border-t border-[#21262D]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#BC8CFF] flex items-center gap-1">
                      Isolation Forest Anomaly Model
                      <TermTooltip termKey="isolation_forest" />
                    </span>
                    <span className="font-mono text-xs text-[#BC8CFF] font-bold">
                      +{currentDetection.isolationForestScore} / 30 pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded bg-[#0E1117] overflow-hidden">
                    <div
                      className="h-full bg-[#BC8CFF] transition-all duration-500"
                      style={{ width: `${(currentDetection.isolationForestScore / 30) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#8B949E]">
                    Unsupervised outlier score across 6-dimensional RF parameter space.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-[#8B949E] mt-3 border-t border-[#21262D] pt-2">
                Contribution bar chart decomposes the overall score into discrete telecom protocol rules and machine learning anomaly dimensions.
              </p>
            </div>

            {/* Confidence Trend Chart & Judge Threshold Slider (6 cols) */}
            <div className="lg:col-span-6 soc-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#1F6FEB]" />
                    <h3 className="text-sm font-semibold text-[#F0F6FC]">Telemetry Confidence Trend &amp; Threshold</h3>
                  </div>
                  <span className="text-xs font-mono text-[#22C55E]">Live Continuous Buffer</span>
                </div>

                {/* Recent Readings Line Trend SVG */}
                <div className="w-full h-32 bg-[#090D13] rounded-lg border border-[#21262D] p-2 relative flex flex-col justify-end">
                  <svg className="w-full h-24 overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
                    {/* Threshold dashed line */}
                    <line
                      x1="0"
                      y1={80 - (userThreshold / 100) * 80}
                      x2="300"
                      y2={80 - (userThreshold / 100) * 80}
                      stroke="#EF4444"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="295"
                      y={80 - (userThreshold / 100) * 80 - 4}
                      fill="#EF4444"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      textAnchor="end"
                    >
                      Threshold: {userThreshold}
                    </text>

                    {/* Trend points line */}
                    {history.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#1F6FEB"
                        strokeWidth="2.5"
                        points={history.map((pt, idx) => {
                          const x = (idx / (history.length - 1)) * 300;
                          const y = 80 - (pt.score / 100) * 75;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                    )}

                    {/* Circles on points */}
                    {history.map((pt, idx) => {
                      const x = (idx / Math.max(1, history.length - 1)) * 300;
                      const y = 80 - (pt.score / 100) * 75;
                      const isAlert = pt.score >= userThreshold;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="3"
                          fill={isAlert ? '#EF4444' : '#22C55E'}
                          stroke="#0E1117"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>
                  <div className="flex justify-between text-[10px] text-[#8B949E] font-mono mt-1 px-1">
                    <span>Older Telemetry</span>
                    <span>Recent Frames</span>
                  </div>
                </div>

                {/* Judge Interactive Threshold Slider */}
                <div className="mt-4 p-3 rounded-lg bg-[#0E1117] border border-[#30363D] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#F0F6FC] flex items-center gap-1.5">
                      <span>Judge Interactive Alert Threshold:</span>
                      <span className="font-mono text-[#1F6FEB] font-bold text-sm">{userThreshold}/100</span>
                    </span>
                    <span className="text-[10px] text-[#8B949E] italic">
                      Drag to live-reclassify alerts
                    </span>
                  </div>

                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="1"
                    value={userThreshold}
                    onChange={(e) => onThresholdChange(Number(e.target.value))}
                    className="w-full accent-[#1F6FEB] bg-[#21262D] h-2 rounded-lg cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-[#8B949E] font-mono">
                    <span>Sensitive (20)</span>
                    <span>Balanced (60)</span>
                    <span>Conservative (90)</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#8B949E] mt-3 border-t border-[#21262D] pt-2">
                Confidence trend tracks risk evolution over consecutive seconds. Adjusting the threshold slider demonstrates how SOC analysts calibrate alert sensitivity without code deployment.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
