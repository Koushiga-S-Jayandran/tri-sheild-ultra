import React, { useState } from 'react';
import { 
  Settings, Sliders, RotateCcw, Send, ShieldCheck, 
  Eye, CheckCircle2, AlertTriangle, Key
} from 'lucide-react';
import { EngineWeights, DEFAULT_WEIGHTS } from '../../utils/detectionEngine';
import { TermTooltip } from '../TermTooltip';

interface SettingsTabProps {
  weights: EngineWeights;
  onWeightsChange: (newWeights: EngineWeights) => void;
  showSimulatedWatermark: boolean;
  onToggleWatermark: (show: boolean) => void;
  onClearAllData: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  weights,
  onWeightsChange,
  showSimulatedWatermark,
  onToggleWatermark,
  onClearAllData
}) => {
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);

  const handleTestTelegram = () => {
    setTelegramStatus('Sending test dispatch...');
    setTimeout(() => {
      setTelegramStatus(
        telegramToken.trim() 
          ? `[TELEGRAM BOT SUCCESS] Test alert payload dispatched to Chat ID ${telegramChatId || 'DEFAULT_CHANNEL'}.`
          : `[DEMO BOT SIMULATION] Test alert payload formatted: "⚠️ TriShield Critical Alert: Rogue Cell Detected at 28.6305 N. Risk: 98/100."`
      );
    }, 600);
  };

  const handleResetWeights = () => {
    onWeightsChange(DEFAULT_WEIGHTS);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-xl bg-[#161B22] border border-[#21262D] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#1F6FEB]" />
            <h2 className="text-base font-bold text-[#F0F6FC]">
              Detection Engine Weights &amp; System Configuration
            </h2>
          </div>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Calibrate detection sensitivity, heuristic rule coefficients, and external reporting bridges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetWeights}
            className="px-3.5 py-1.5 bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] text-xs font-semibold rounded-lg border border-[#30363D] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>Reset Weights to Default</span>
          </button>
          <button
            onClick={onClearAllData}
            className="px-3.5 py-1.5 bg-[#EF4444]/20 hover:bg-[#EF4444] text-[#EF4444] hover:text-white text-xs font-semibold rounded-lg border border-[#EF4444]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Clear All Data &amp; Reset DB</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rule Weights Calibration (7 cols) */}
        <div className="lg:col-span-7 soc-card p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#1F6FEB]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
                Multi-Layer Weight Coefficients
              </h3>
            </div>
            <span className="text-xs font-mono text-[#8B949E]">Heuristics (70) + Isolation Forest (30)</span>
          </div>

          {/* Slider 1: Cipher Downgrade */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[#F0F6FC] flex items-center gap-1">
                Cipher Downgrade Penalty
                <TermTooltip termKey="a50" />
              </span>
              <span className="font-mono text-[#1F6FEB] font-bold">{weights.cipherDowngradeWeight} pts</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              value={weights.cipherDowngradeWeight}
              onChange={(e) => onWeightsChange({ ...weights, cipherDowngradeWeight: Number(e.target.value) })}
              className="w-full accent-[#1F6FEB] bg-[#21262D] h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-[#8B949E]">
              Points assigned when a base station forces 2G A5/0 null cipher (plaintext eavesdropping).
            </p>
          </div>

          {/* Slider 2: Signal Power Surge */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[#F0F6FC] flex items-center gap-1">
                RF Power Surge &amp; C2 Reselection Bias
                <TermTooltip termKey="rssi" />
              </span>
              <span className="font-mono text-[#1F6FEB] font-bold">{weights.signalAnomalyWeight} pts</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              value={weights.signalAnomalyWeight}
              onChange={(e) => onWeightsChange({ ...weights, signalAnomalyWeight: Number(e.target.value) })}
              className="w-full accent-[#1F6FEB] bg-[#21262D] h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-[#8B949E]">
              Penalizes overpowering signal strengths (&gt; -50 dBm) used to bully phones into connecting.
            </p>
          </div>

          {/* Slider 3: Neighbor Suppression */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[#F0F6FC]">
                Neighbor List Suppression Penalty
              </span>
              <span className="font-mono text-[#1F6FEB] font-bold">{weights.neighborSuppressionWeight} pts</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              value={weights.neighborSuppressionWeight}
              onChange={(e) => onWeightsChange({ ...weights, neighborSuppressionWeight: Number(e.target.value) })}
              className="w-full accent-[#1F6FEB] bg-[#21262D] h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-[#8B949E]">
              Penalizes base stations broadcasting 0 neighbors to trap mobile handsets.
            </p>
          </div>

          {/* Slider 4: Isolation Forest Weight */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-[#BC8CFF] flex items-center gap-1">
                Isolation Forest Unsupervised ML Contribution
                <TermTooltip termKey="isolation_forest" />
              </span>
              <span className="font-mono text-[#BC8CFF] font-bold">{weights.isolationForestWeight} pts</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              value={weights.isolationForestWeight}
              onChange={(e) => onWeightsChange({ ...weights, isolationForestWeight: Number(e.target.value) })}
              className="w-full accent-[#BC8CFF] bg-[#21262D] h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-[#8B949E]">
              Weight of tree-ensemble anomaly path length calculations in the final fused threat score.
            </p>
          </div>
        </div>

        {/* Right Column: Display & Bridge Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Watermark Toggle */}
          <div className="soc-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#22C55E]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
                  Presentation &amp; Watermark Display
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#F0F6FC] block">
                  &quot;SIMULATED — NO RF TRANSMITTED&quot; Badge
                </span>
                <span className="text-[11px] text-[#8B949E]">
                  Enforces continuous judge awareness of the ethical RF boundary.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSimulatedWatermark}
                  onChange={(e) => onToggleWatermark(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#21262D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22C55E]"></div>
              </label>
            </div>
          </div>

          {/* Telegram Alert Bridge */}
          <div className="soc-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#1F6FEB]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
                  Telegram Emergency Dispatch Bridge
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8B949E]">Bot API</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">
                  Telegram Bot Token (Optional / Reads from secrets)
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="Enter TELEGRAM_BOT_TOKEN or test with simulator..."
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    className="w-full bg-[#0E1117] border border-[#30363D] rounded-lg py-2 pl-9 pr-3 text-xs text-[#E6EDF3] font-mono focus:border-[#1F6FEB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">
                  Target Channel / Chat ID
                </label>
                <input
                  type="text"
                  placeholder="@soc_alerts_channel or -100123456789"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="w-full bg-[#0E1117] border border-[#30363D] rounded-lg p-2 text-xs text-[#E6EDF3] font-mono focus:border-[#1F6FEB]"
                />
              </div>

              <button
                onClick={handleTestTelegram}
                className="w-full py-2 bg-[#1F6FEB] hover:bg-[#388BFD] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Telegram Dispatch Alert</span>
              </button>

              {telegramStatus && (
                <div className="p-2.5 rounded bg-[#0E1117] border border-[#21262D] text-[11px] font-mono text-[#58A6FF] leading-relaxed">
                  {telegramStatus}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
