export type SeverityLevel = 'SAFE' | 'CAUTION' | 'DANGER';

export interface CellularReading {
  id: string;
  timestamp: string;
  deviceId: string; // Synthetic e.g. "SIM-DEMO-001" or masked "***7821"
  mcc: string; // Mobile Country Code (e.g. 404 for India, 310 for US)
  mnc: string; // Mobile Network Code (e.g. 45 for Airtel/Jio)
  lac: number; // Location Area Code
  cellId: number; // Cell Tower Identifier
  arfcn: number; // Absolute Radio Frequency Channel Number
  rssi: number; // Signal strength in dBm (-115 to -40)
  timingAdvance: number; // Distance measure (0 to 63)
  encryption: 'A5/3 (Strong 3G/4G)' | 'EEA2 (AES-128 4G)' | 'A5/1 (Legacy 2G)' | 'A5/0 (No Encryption / Null)';
  band: string; // e.g. "LTE Band 3 (1800MHz)" or "GSM 900"
  neighborCount: number; // Number of advertised adjacent towers
  c2ReselectionBias: number; // Bias points added to force device reselection
  rejectCause?: string; // e.g. "IMSI Detached / Location Update Reject #15"
  towerLabel: string; // e.g. "Home Cell", "Office Macro", "Unknown Transmitter"
  lat: number;
  lng: number;
  isSimulated: boolean;
}

export interface RuleContribution {
  name: string;
  points: number;
  maxPoints: number;
  triggered: boolean;
  explanation: string;
  technicalDetails: string;
}

export interface DetectionResult {
  readingId: string;
  timestamp: string;
  riskScore: number; // 0 - 100
  severity: SeverityLevel;
  ruleScore: number; // 0 - 70
  isolationForestScore: number; // 0 - 30 (anomaly score)
  ruleContributions: RuleContribution[];
  summaryHeadline: string;
  plainEnglishReason: string;
  recommendedAction: string;
  isAlert: boolean;
  isReportReady: boolean;
}

export interface EvidenceBlock {
  index: number;
  timestamp: string;
  prevHash: string;
  hash: string;
  reading: CellularReading;
  detection: DetectionResult;
  tampered?: boolean;
  originalPayloadHash?: string;
}

export interface ScenarioDefinition {
  id: 'normal' | 'retune' | 'rogue_basic' | 'rogue_downgrade' | 'rogue_clone';
  name: string;
  tag: string;
  badgeColor: 'green' | 'amber' | 'red';
  description: string;
  expectedScore: string;
  judgeTakeaway: string;
  readingTemplate: Partial<CellularReading>;
}

export interface FleetDevice {
  id: string;
  label: string;
  currentTower: string;
  rssi: number;
  encryption: string;
  status: 'SAFE' | 'ATTACK_TARGETED' | 'CAPTIVE';
  lat: number;
  lng: number;
}
