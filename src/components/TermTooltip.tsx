import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export const GLOSSARY: Record<string, { term: string; explanation: string }> = {
  'isolation_forest': {
    term: 'Isolation Forest',
    explanation: 'An unsupervised machine learning algorithm that isolates anomalies instead of profiling normal points. Unusual cellular spikes take very few tree splits to isolate, flagging them as rogue behavior.'
  },
  'sha256': {
    term: 'SHA-256 Hash Chain',
    explanation: 'A cryptographic digital fingerprint. Each log block links mathematically to the previous block. Changing even one character breaks the chain and exposes tampering immediately.'
  },
  'arfcn': {
    term: 'ARFCN (Radio Channel)',
    explanation: 'Absolute Radio Frequency Channel Number: the broadcast channel of the tower. Legitimate carriers retune channels during maintenance; rogue towers use unallocated channels to hijack handsets.'
  },
  'imsi': {
    term: 'IMSI (Subscriber Identity)',
    explanation: 'International Mobile Subscriber Identity: your SIM card\'s confidential ID. IMSI Catchers force phones into unencrypted 2G mode specifically to harvest this identifier and track victims.'
  },
  'lac': {
    term: 'LAC (Location Area Code)',
    explanation: 'A geographic zone code broadcasted by legitimate carriers. Rogue towers often broadcast fake LACs to trigger an immediate Location Update and harvest subscriber credentials.'
  },
  'timing_advance': {
    term: 'Timing Advance (TA)',
    explanation: 'Measures radio propagation time between phone and tower (~550m per unit). A mismatch between high signal strength and large timing advance exposes physical transmitter spoofing.'
  },
  'rssi': {
    term: 'RSSI (Signal Power)',
    explanation: 'Received Signal Strength Indicator (in dBm). Closer to 0 means stronger. Rogue towers crank up power (-45 dBm) to shout over legitimate towers and force phones to connect.'
  },
  'a50': {
    term: 'A5/0 Null Cipher',
    explanation: 'A 2G GSM mode with ZERO encryption. When forced onto A5/0, all phone calls, text messages, and identity frames travel through the air completely in plaintext.'
  }
};

interface TermTooltipProps {
  termKey: keyof typeof GLOSSARY;
  children?: React.ReactNode;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({ termKey, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const info = GLOSSARY[termKey] || { term: termKey, explanation: '' };

  return (
    <span className="relative inline-flex items-center gap-1 group">
      {children && <span className="underline decoration-dotted decoration-slate-500 underline-offset-4 cursor-help">{children}</span>}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-[#8B949E] hover:text-[#1F6FEB] transition-colors p-0.5 rounded cursor-pointer focus:outline-none"
        aria-label={`Learn more about ${info.term}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-[#161B22] border border-[#1F6FEB]/40 rounded-lg shadow-2xl text-left pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95"
        >
          <span className="block text-xs font-semibold text-[#1F6FEB] mb-1 font-mono">{info.term}</span>
          <span className="block text-xs text-[#E6EDF3] leading-relaxed font-sans font-normal">{info.explanation}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#161B22]"></span>
        </span>
      )}
    </span>
  );
};
