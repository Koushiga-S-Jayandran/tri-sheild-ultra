import React from 'react';
import { X, ShieldCheck, Cpu, Brain, Lock, Radio, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ExplainersModalProps {
  mode: 'how_it_works' | 'real_vs_simulated' | null;
  onClose: () => void;
}

export const ExplainersModal: React.FC<ExplainersModalProps> = ({ mode, onClose }) => {
  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="soc-card bg-[#161B22] border border-[#30363D] w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21262D] bg-[#0E1117]">
          <div className="flex items-center gap-3">
            {mode === 'how_it_works' ? (
              <div className="w-8 h-8 rounded-lg bg-[#1F6FEB]/15 flex items-center justify-center text-[#1F6FEB]">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#22C55E]/15 flex items-center justify-center text-[#22C55E]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-base font-semibold text-[#F0F6FC]">
                {mode === 'how_it_works' ? 'TriShield 4-Step Detection Architecture' : "Engineering Transparency: What's Real vs. Simulated"}
              </h2>
              <p className="text-xs text-[#8B949E]">
                {mode === 'how_it_works' 
                  ? 'How TriShield detects rogue towers, prevents eavesdropping, and secures evidence' 
                  : 'Judge-facing boundary statement regarding real algorithms vs RF safety'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {mode === 'how_it_works' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-lg bg-[#0E1117] border border-[#21262D]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#1F6FEB] text-white text-xs font-bold flex items-center justify-center font-mono">1</span>
                    <Radio className="w-4 h-4 text-[#1F6FEB]" />
                    <h3 className="text-sm font-semibold text-[#F0F6FC]">Edge Telemetry Capture</h3>
                  </div>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    Edge sensors capture broadcast cell parameters without transmitting: signal power (RSSI), cipher algorithm (A5/0 to A5/3), timing advance propagation delay, and neighbor cell handoff lists.
                  </p>
                  <div className="mt-2 text-[11px] text-[#58A6FF] font-mono">
                    Input: JSON telemetry via standard REST / WebSockets API
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-lg bg-[#0E1117] border border-[#21262D]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#1F6FEB] text-white text-xs font-bold flex items-center justify-center font-mono">2</span>
                    <Cpu className="w-4 h-4 text-[#58A6FF]" />
                    <h3 className="text-sm font-semibold text-[#F0F6FC]">Deterministic Rule Engine</h3>
                  </div>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    Instantly flags hard protocol violations: forced 2G downgrade to A5/0 null cipher (plaintext eavesdropping), empty neighbor lists (preventing handoff), and impossible power overrides.
                  </p>
                  <div className="mt-2 text-[11px] text-[#58A6FF] font-mono">
                    Output: 0 - 70 points rule contribution matrix
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-lg bg-[#0E1117] border border-[#21262D]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#1F6FEB] text-white text-xs font-bold flex items-center justify-center font-mono">3</span>
                    <Brain className="w-4 h-4 text-[#BC8CFF]" />
                    <h3 className="text-sm font-semibold text-[#F0F6FC]">Isolation Forest Machine Learning</h3>
                  </div>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    An unsupervised decision tree ensemble evaluates the multi-dimensional feature space. Abnormal combinations that evade single thresholds are partitioned in very few tree splits and scored as anomalies.
                  </p>
                  <div className="mt-2 text-[11px] text-[#BC8CFF] font-mono">
                    Output: 0 - 30 points anomaly fusion score
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-lg bg-[#0E1117] border border-[#21262D]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#1F6FEB] text-white text-xs font-bold flex items-center justify-center font-mono">4</span>
                    <Lock className="w-4 h-4 text-[#22C55E]" />
                    <h3 className="text-sm font-semibold text-[#F0F6FC]">Tamper-Evident SHA-256 Ledger</h3>
                  </div>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    Every incident is cryptographically linked to the prior record using SHA-256 hashing. If an insider or attacker modifies a log, mathematical verification fails instantly. Generates court-admissible PDF reports.
                  </p>
                  <div className="mt-2 text-[11px] text-[#22C55E] font-mono">
                    Output: SHA-256 chain seal & National Cybercrime format
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#21262D]/60 border border-[#30363D] flex items-center justify-between text-xs text-[#8B949E]">
                <span>Total Fused Risk Score = Rule Heuristics (max 70) + Isolation Forest (max 30)</span>
                <span className="text-[#22C55E] font-medium font-mono">0 (Safe) → 100 (Rogue Confirmed)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-[#EF4444] block">Non-Negotiable Ethical & Legal Boundary</span>
                  <p className="text-[#E6EDF3] leading-relaxed">
                    TriShield <strong>NEVER</strong> transmits on real cellular radio frequencies. Operating real transmitters without licensed carrier spectrum violates international telecommunications laws (e.g. FCC Title 47, Indian Wireless Telegraphy Act). All rogue scenarios shown are synthetic payloads injected via standard sensor APIs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#0E1117] border border-[#22C55E]/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#22C55E] font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>What Is 100% REAL</span>
                  </div>
                  <ul className="text-xs text-[#8B949E] space-y-1.5 list-disc list-inside">
                    <li><strong className="text-[#F0F6FC]">Isolation Forest Engine:</strong> Real mathematical ensemble trees computing anomaly path lengths</li>
                    <li><strong className="text-[#F0F6FC]">Cryptographic Ledger:</strong> Real SHA-256 block hashing and continuous tamper verification</li>
                    <li><strong className="text-[#F0F6FC]">Telecom Rule Matrix:</strong> Real 3GPP cellular standards for A5/0 ciphers, C2 offsets, and neighbor lists</li>
                    <li><strong className="text-[#F0F6FC]">PDF Evidentiary Export:</strong> Real forensic document generation with SHA-256 digital seals</li>
                    <li><strong className="text-[#F0F6FC]">Scoring & Thresholding:</strong> Dynamic multi-variable fusion and classification logic</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#0E1117] border border-[#58A6FF]/30 space-y-2">
                  <div className="flex items-center gap-2 text-[#58A6FF] font-semibold text-sm">
                    <Radio className="w-4 h-4" />
                    <span>What Is SIMULATED (Phase 1)</span>
                  </div>
                  <ul className="text-xs text-[#8B949E] space-y-1.5 list-disc list-inside">
                    <li><strong className="text-[#F0F6FC]">RF Radio Transmission:</strong> Ingested as structured JSON telemetry payloads</li>
                    <li><strong className="text-[#F0F6FC]">Subscriber Identifiers:</strong> Synthetic IDs like &quot;SIM-DEMO-001&quot; or masked &quot;***7821&quot; to protect privacy</li>
                    <li><strong className="text-[#F0F6FC]">Phase 2 Production Swap:</strong> The identical REST / WebSocket API seamlessly connects to real physical SDRs (Software Defined Radios like BladeRF / RTL-SDR) or passive GSM modem sniffers</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0E1117] border-t border-[#21262D] flex items-center justify-between text-xs text-[#8B949E]">
          <span className="font-mono">TriShield SOC v2.4 · Demo Release for Judges</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1F6FEB] hover:bg-[#388BFD] text-white rounded-md font-medium text-xs transition-colors cursor-pointer"
          >
            Close Explainer
          </button>
        </div>
      </div>
    </div>
  );
};
