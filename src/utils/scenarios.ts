import { CellularReading, ScenarioDefinition, FleetDevice } from '../types/trishield';

export const BASE_COORDINATES = {
  // Financial District / Tech Hub coordinates (simulated security zone)
  homeLat: 28.6289,
  homeLng: 77.2065,
  officeLat: 28.6321,
  officeLng: 77.2185,
  rogueLat: 28.6305,
  rogueLng: 77.2120
};

export const SCENARIOS: Record<string, ScenarioDefinition> = {
  normal: {
    id: 'normal',
    name: 'Normal Carrier Tower',
    tag: 'Baseline Nominal',
    badgeColor: 'green',
    description: 'Standard 4G LTE macro base station with authentic encryption and full neighbor topology.',
    expectedScore: '< 15 (SAFE)',
    judgeTakeaway: 'Clean network traffic. Demonstrates baseline nominal operation with strong encryption.',
    readingTemplate: {
      deviceId: 'SIM-DEMO-001',
      mcc: '404',
      mnc: '45',
      lac: 40221,
      cellId: 18402,
      arfcn: 1520,
      rssi: -85,
      timingAdvance: 4,
      encryption: 'EEA2 (AES-128 4G)',
      band: 'LTE Band 3 (1800 MHz)',
      neighborCount: 6,
      c2ReselectionBias: 0,
      towerLabel: 'Airtel Macro Cell #18402',
      lat: BASE_COORDINATES.homeLat,
      lng: BASE_COORDINATES.homeLng,
      isSimulated: true
    }
  },
  retune: {
    id: 'retune',
    name: 'Legitimate Frequency Retune',
    tag: 'Maintenance Event',
    badgeColor: 'green',
    description: 'Authorized operator retune during spectrum maintenance. Channel shifted, but encryption and neighbor topology remain valid.',
    expectedScore: '< 20 (SAFE)',
    judgeTakeaway: 'Key differentiator: Routine carrier changes do NOT trigger false positives because cipher and neighbors are intact.',
    readingTemplate: {
      deviceId: 'SIM-DEMO-001',
      mcc: '404',
      mnc: '45',
      lac: 40221,
      cellId: 18402,
      arfcn: 1640, // Shifted channel frequency
      rssi: -81,
      timingAdvance: 4,
      encryption: 'EEA2 (AES-128 4G)',
      band: 'LTE Band 3 (Retuned)',
      neighborCount: 5,
      c2ReselectionBias: 2,
      towerLabel: 'Airtel Macro Cell #18402 (Retuned)',
      lat: BASE_COORDINATES.homeLat,
      lng: BASE_COORDINATES.homeLng,
      isSimulated: true
    }
  },
  rogue_basic: {
    id: 'rogue_basic',
    name: 'Rogue Cell (RF Hijack)',
    tag: 'Unregistered Cell',
    badgeColor: 'red',
    description: 'Unregistered high-power transmitter broadcasting rogue LAC with maximum reselection bias and zero neighbor lists.',
    expectedScore: '75 - 85 (DANGER)',
    judgeTakeaway: 'Detects illegal power surge and neighbor suppression attempting to trap mobile handsets.',
    readingTemplate: {
      deviceId: 'SIM-DEMO-001',
      mcc: '404',
      mnc: '45',
      lac: 99104, // Unregistered rogue LAC
      cellId: 65530,
      arfcn: 975,
      rssi: -48, // Aggressively high RF power
      timingAdvance: 1,
      encryption: 'A5/1 (Legacy 2G)',
      band: 'GSM 900 (High Gain)',
      neighborCount: 0, // Suppressed
      c2ReselectionBias: 18,
      towerLabel: 'Unregistered Rogue Transmitter #65530',
      lat: BASE_COORDINATES.rogueLat,
      lng: BASE_COORDINATES.rogueLng,
      isSimulated: true
    }
  },
  rogue_downgrade: {
    id: 'rogue_downgrade',
    name: 'Rogue Downgrade (IMSI Catcher)',
    tag: 'Active Exploitation',
    badgeColor: 'red',
    description: 'Classic StingRay / IMSI catcher forcing devices onto 2G with A5/0 null cipher (zero encryption) and identity extraction.',
    expectedScore: '94 - 100 (DANGER)',
    judgeTakeaway: 'Catches active eavesdropping: forced downgrade removes all encryption so voice/SMS and IMSI can be intercepted.',
    readingTemplate: {
      deviceId: 'SIM-DEMO-001',
      mcc: '404',
      mnc: '45',
      lac: 99881,
      cellId: 65534,
      arfcn: 102,
      rssi: -44,
      timingAdvance: 1,
      encryption: 'A5/0 (No Encryption / Null)',
      band: 'GSM 900 (Forced Plaintext)',
      neighborCount: 0,
      c2ReselectionBias: 24,
      rejectCause: 'Forced Location Update Reject (Code #15: IMSI Detach)',
      towerLabel: 'Rogue IMSI Catcher (A5/0 Forced)',
      lat: BASE_COORDINATES.rogueLat,
      lng: BASE_COORDINATES.rogueLng,
      isSimulated: true
    }
  },
  rogue_clone: {
    id: 'rogue_clone',
    name: 'Cell ID Spoof / Clone Attack',
    tag: 'Stealth Impersonation',
    badgeColor: 'red',
    description: 'Rogue tower impersonates legitimate Cell ID #18402 and LAC #40221, but timing advance geometry and neighbor synchronization fail.',
    expectedScore: '85 - 92 (DANGER)',
    judgeTakeaway: 'Stops sophisticated spoofing: even when attacker clones an authentic tower ID, radio physics betray them.',
    readingTemplate: {
      deviceId: 'SIM-DEMO-001',
      mcc: '404',
      mnc: '45',
      lac: 40221, // Cloned legitimate LAC
      cellId: 18402, // Cloned legitimate Cell ID
      arfcn: 1520,
      rssi: -49, // Unnaturally strong signal (+36 dBm difference)
      timingAdvance: 12, // Physical propagation contradiction
      encryption: 'A5/1 (Legacy 2G)',
      band: 'LTE/GSM Spoof Carrier',
      neighborCount: 0, // Cloned tower fails to synchronize true neighbor handovers
      c2ReselectionBias: 16,
      towerLabel: 'Spoofed Impersonator of Cell #18402',
      lat: BASE_COORDINATES.rogueLat,
      lng: BASE_COORDINATES.rogueLng,
      isSimulated: true
    }
  }
};

export const INITIAL_FLEET: FleetDevice[] = [
  { id: 'SIM-DEMO-001', label: 'VIP Executive UE (Android)', currentTower: 'Airtel Macro #18402', rssi: -85, encryption: 'EEA2', status: 'SAFE', lat: 28.6292, lng: 77.2070 },
  { id: 'SIM-DEMO-002', label: 'Field Patrol Unit Alpha', currentTower: 'Airtel Macro #18402', rssi: -82, encryption: 'EEA2', status: 'SAFE', lat: 28.6298, lng: 77.2095 },
  { id: 'SIM-DEMO-003', label: 'Government Courier Transceiver', currentTower: 'Connaught Macro #19201', rssi: -89, encryption: 'EEA2', status: 'SAFE', lat: 28.6315, lng: 77.2140 },
  { id: 'SIM-DEMO-004', label: 'Escort Vehicle Fleet Tracker', currentTower: 'Connaught Macro #19201', rssi: -79, encryption: 'EEA2', status: 'SAFE', lat: 28.6330, lng: 77.2175 }
];

export const ATTACKER_SCRIPTS: Record<string, string[]> = {
  normal: [
    `[TELECOM MONITOR] Initializing RF edge sensor telemetry intake...`,
    `[RF HARVEST] Listening on downlink ARFCN 1520 (EARFCN 1600). Nominal SIB1/SIB2 detected.`,
    `[CIPHER CHECK] Handshake: UE negotiated 3GPP Rel-15 AES-128 (EEA2). Integrity: EIA2 verified.`,
    `[STATUS] Serving cell 18402 verified legitimate. Telemetry within nominal statistical envelopes.`
  ],
  retune: [
    `[TELECOM MONITOR] Carrier broadcast re-allocation frame received.`,
    `[SPECTRUM LOG] Operator Airtel initiating scheduled channel maintenance.`,
    `[RECONF] Downlink channel shifted from 1520 -> 1640.`,
    `[VALIDATION] Neighbor list preserved (5 valid macro neighbors). Ciphering maintained on EEA2.`,
    `[ENGINE] Rule score: 4/70 | Isolation Forest: 7/30 -> Total 11/100 (NOMINAL / NO ALERT).`
  ],
  rogue_basic: [
    `[RF DETECT] High-gain transmitter burst detected at 28.6305° N, 77.2120° E.`,
    `[POWER SPURT] Target RSSI escalated to -48 dBm (20dB above surrounding ambient noise).`,
    `[ATTACK BEACON] Broadcaster advertising CRO=+18dB offset to force handset cell-reselection.`,
    `[WARNING] BCCH Allocation List broadcasted as 0 entries (Neighbor suppression active).`,
    `[TRISHIELD] Tri-layer fusion triggered: Risk Score 78/100. Threat vector isolated.`
  ],
  rogue_downgrade: [
    `[RF INTERCEPTOR] SDR (BladeRF/HackRF simulation profile) initialized on GSM 900.`,
    `[IMSI TRAP] Downward release redirection transmitted: RRC Connection Reject with cause 'redirect to GERAN'.`,
    `[CIPHER STRIP] Base station issues 'Ciphering Mode Command' with Cipher Algorithm = 0 (A5/0 NULL CIPHER).`,
    `[EXFILTRATION] Identity Request sent: Target handset forced to transmit unencrypted IMSI over plaintext link.`,
    `[TRISHIELD CRITICAL] Risk Score: 98/100. Forced Null Cipher detected! Cryptographic evidence sealed into blockchain ledger.`
  ],
  rogue_clone: [
    `[STEALTH HARVEST] Attacker cloned broadcast parameters of Macro Cell #18402 (MCC 404, MNC 45, LAC 40221).`,
    `[PHYSICAL MISMATCH] RF Power delta: Expected -85 dBm at this location, received -49 dBm (+36dB surge).`,
    `[GEOMETRY CHECK] Timing Advance = 12 (~6.6km propagation) directly conflicts with near-field -49 dBm power.`,
    `[NEIGHBOR AUDIT] True Cell #18402 broadcasts 6 adjacent neighbors. Rogue clone broadcasts 0 neighbors.`,
    `[TRISHIELD ALERT] Identity theft confirmed. Impersonation attack neutralized.`
  ]
};

/**
 * Generates 20 randomized legitimate telecom events to prove the engine does NOT false positive
 */
export function generateFalsePositiveBatch(): CellularReading[] {
  const events: CellularReading[] = [];
  const baseLacs = [40221, 40222, 40220];
  const baseCells = [18402, 18403, 19201, 19202, 21045];
  
  for (let i = 1; i <= 20; i++) {
    const isRetune = i % 4 === 0;
    const isFading = i % 5 === 0;
    const rssi = isFading ? -94 - Math.floor(Math.random() * 8) : -76 - Math.floor(Math.random() * 14);
    const neighbors = isFading ? 3 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 3);
    const lac = baseLacs[Math.floor(Math.random() * baseLacs.length)];
    const cellId = baseCells[Math.floor(Math.random() * baseCells.length)];
    const ta = Math.floor(Math.random() * 6) + 2;

    events.push({
      id: `BATCH-LEGIT-${i.toString().padStart(2, '0')}`,
      timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
      deviceId: `SIM-DEMO-${(i % 4) + 1}`,
      mcc: '404',
      mnc: '45',
      lac,
      cellId,
      arfcn: isRetune ? 1640 : 1520,
      rssi,
      timingAdvance: ta,
      encryption: 'EEA2 (AES-128 4G)',
      band: isRetune ? 'LTE Band 3 (Retuned)' : 'LTE Band 3 (1800MHz)',
      neighborCount: neighbors,
      c2ReselectionBias: Math.floor(Math.random() * 3),
      towerLabel: `Airtel Cell #${cellId} (Legit)`,
      lat: BASE_COORDINATES.homeLat + (Math.random() - 0.5) * 0.008,
      lng: BASE_COORDINATES.homeLng + (Math.random() - 0.5) * 0.008,
      isSimulated: true
    });
  }

  return events;
}
