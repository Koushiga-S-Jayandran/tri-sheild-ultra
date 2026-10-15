import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, 
  RefreshCw, Lock, Link, Eye, Copy, Check
} from 'lucide-react';
import { EvidenceBlock } from '../../types/trishield';
import { verifyEvidenceChain } from '../../utils/crypto';
import { TermTooltip } from '../TermTooltip';

interface EvidenceLogTabProps {
  evidenceChain: EvidenceBlock[];
  onTamperBlock: (index: number) => void;
  onRestoreChain: () => void;
  isTampered: boolean;
}

export const EvidenceLogTab: React.FC<EvidenceLogTabProps> = ({
  evidenceChain,
  onTamperBlock,
  onRestoreChain,
  isTampered
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    tamperedIndex: number | null;
    message: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    const res = await verifyEvidenceChain(evidenceChain);
    setTimeout(() => {
      setVerificationResult(res);
      setIsVerifying(false);
    }, 300);
  };

  const handleCopy = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Find tampered block if any
  const tamperedBlockIndex = evidenceChain.findIndex(b => b.tampered);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Status Banner */}
      <div className="p-5 rounded-xl bg-[#161B22] border border-[#21262D] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#22C55E]" />
            <h2 className="text-base font-bold text-[#F0F6FC]">
              Tamper-Evident SHA-256 Cryptographic Evidence Ledger
            </h2>
            <TermTooltip termKey="sha256" />
          </div>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Every cellular threat event is sealed with continuous cryptographic hash chaining to maintain chain of custody for law enforcement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-mono font-bold ${
            isTampered || (verificationResult && !verificationResult.isValid)
              ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
              : 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
          }`}>
            {isTampered || (verificationResult && !verificationResult.isValid) ? (
              <>
                <ShieldAlert className="w-4 h-4 animate-bounce" />
                <span>CHAIN STATUS: TAMPER DETECTED</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>CHAIN STATUS: VERIFIED ({evidenceChain.length} BLOCKS)</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-3.5 py-1.5 bg-[#1F6FEB] hover:bg-[#388BFD] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>Verify Chain Integrity</span>
          </button>

          {!isTampered ? (
            <button
              onClick={() => onTamperBlock(evidenceChain.length > 1 ? 1 : 0)}
              className="px-3.5 py-1.5 bg-[#EF4444]/20 hover:bg-[#EF4444] text-[#EF4444] hover:text-white text-xs font-semibold rounded-lg border border-[#EF4444]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Run Tamper Test (Simulate Attack)</span>
            </button>
          ) : (
            <button
              onClick={onRestoreChain}
              className="px-3.5 py-1.5 bg-[#22C55E] hover:bg-[#16A34A] text-black text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Restore Authentic Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Verification Feedback Banner */}
      {verificationResult && (
        <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition-all ${
          verificationResult.isValid
            ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]'
            : 'bg-[#EF4444]/15 border-[#EF4444]/50 text-[#EF4444]'
        }`}>
          {verificationResult.isValid ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#22C55E]" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#EF4444]" />
          )}
          <div className="space-y-1">
            <span className="font-bold text-sm block">
              {verificationResult.isValid ? 'Cryptographic Proof Succeeded' : 'Data Integrity Breach Detected!'}
            </span>
            <p className="text-[#E6EDF3] leading-relaxed">{verificationResult.message}</p>
          </div>
        </div>
      )}

      {/* Visual Hash Chain Diagram for Judges */}
      <div className="soc-card p-5">
        <div className="flex items-center justify-between mb-3 border-b border-[#21262D] pb-2">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4 text-[#1F6FEB]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
              Visual Hash Chain Continuity Diagram
            </h3>
          </div>
          <span className="text-[11px] text-[#8B949E]">Block Hash = SHA-256(Block Payload + Previous Hash)</span>
        </div>

        {/* Horizontal Block Nodes Diagram */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max py-2">
            {evidenceChain.slice(-5).map((block, idx) => {
              const isBlockTampered = block.tampered;
              return (
                <React.Fragment key={block.index}>
                  {idx > 0 && (
                    <div className="flex items-center text-[#8B949E] px-1">
                      <div className="w-6 h-0.5 bg-[#30363D]" />
                      <span className="text-xs font-mono px-1 text-[#1F6FEB]">→</span>
                      <div className="w-6 h-0.5 bg-[#30363D]" />
                    </div>
                  )}

                  <div className={`p-3 rounded-lg border w-56 text-xs font-mono space-y-1 transition-all ${
                    isBlockTampered
                      ? 'bg-[#EF4444]/15 border-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                      : 'bg-[#0E1117] border-[#21262D]'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className={isBlockTampered ? 'text-[#EF4444]' : 'text-[#F0F6FC]'}>
                        Block #{block.index} {block.index === 0 && '(Genesis)'}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                        isBlockTampered ? 'bg-[#EF4444] text-white' : 'bg-[#22C55E]/20 text-[#22C55E]'
                      }`}>
                        {isBlockTampered ? 'CORRUPT' : 'SEALED'}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#8B949E]">
                      Prev: <span className="text-[#58A6FF]">{block.prevHash.substring(0, 8)}…</span>
                    </div>
                    <div className="text-[10px] text-[#8B949E]">
                      Hash: <span className={isBlockTampered ? 'text-[#EF4444]' : 'text-[#22C55E]'}>{block.hash.substring(0, 8)}…</span>
                    </div>
                    <div className="text-[10px] text-[#8B949E] truncate">
                      Event: Cell #{block.reading.cellId} ({block.reading.encryption.split(' ')[0]})
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <p className="text-[11px] text-[#8B949E] mt-2">
          Each block contains a cryptographic seal of its payload and points to the previous block&apos;s hash. Modifying any past record breaks every subsequent link in the chain.
        </p>
      </div>

      {/* Evidence Log Table */}
      <div className="soc-card overflow-hidden">
        <div className="p-4 border-b border-[#21262D] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
            Forensic Incident Event Log ({evidenceChain.length} Entries)
          </h3>
          <span className="text-xs text-[#8B949E]">Hover over hashes to view full 256-bit hexadecimal string</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#0E1117] text-[#8B949E] border-b border-[#21262D] font-mono text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Block #</th>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Cell ID / LAC</th>
                <th className="py-2.5 px-4">Cipher Mode</th>
                <th className="py-2.5 px-4">Signal (RSSI)</th>
                <th className="py-2.5 px-4">Risk Score</th>
                <th className="py-2.5 px-4">SHA-256 Hash Seal</th>
                <th className="py-2.5 px-4">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262D]">
              {evidenceChain.map((block) => {
                const isTamperedRow = block.tampered;
                return (
                  <tr
                    key={block.index}
                    className={`transition-colors font-mono ${
                      isTamperedRow
                        ? 'bg-[#EF4444]/15 text-[#EF4444]'
                        : 'hover:bg-[#21262D]/50 text-[#E6EDF3]'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold">#{block.index}</td>
                    <td className="py-3 px-4 text-xs text-[#8B949E] font-sans">
                      {new Date(block.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      {block.reading.cellId} <span className="text-[#8B949E]">/ {block.reading.lac}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        block.reading.encryption.includes('A5/0') ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                        block.reading.encryption.includes('A5/1') ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                        'bg-[#22C55E]/20 text-[#22C55E]'
                      }`}>
                        {block.reading.encryption.split(' ')[0]}
                      </span>
                    </td>
                    <td className="py-3 px-4">{block.reading.rssi} dBm</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${
                        block.detection.riskScore >= 60 ? 'text-[#EF4444]' :
                        block.detection.riskScore >= 35 ? 'text-[#F59E0B]' : 'text-[#22C55E]'
                      }`}>
                        {block.detection.riskScore}/100
                      </span>
                    </td>

                    {/* SHA-256 Hash with hover tooltip and click-to-copy */}
                    <td className="py-3 px-4">
                      <div className="relative group inline-block">
                        <button
                          onClick={() => handleCopy(block.hash)}
                          className="flex items-center gap-1.5 text-xs text-[#58A6FF] hover:underline cursor-pointer"
                        >
                          <span>{block.hash.substring(0, 10)}…{block.hash.substring(block.hash.length - 6)}</span>
                          {copiedHash === block.hash ? (
                            <Check className="w-3 h-3 text-[#22C55E]" />
                          ) : (
                            <Copy className="w-3 h-3 text-[#8B949E] opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                        {/* Hover Full Tooltip */}
                        <div className="absolute z-50 bottom-full left-0 mb-1 hidden group-hover:block p-2 bg-[#090D13] border border-[#30363D] rounded shadow-xl text-[10px] font-mono text-[#F0F6FC] whitespace-nowrap">
                          Full SHA-256: {block.hash}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isTamperedRow ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#EF4444] text-white font-bold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> TAMPERED
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> VERIFIED
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
