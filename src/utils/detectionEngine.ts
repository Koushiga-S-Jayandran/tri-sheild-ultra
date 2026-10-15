import { CellularReading, DetectionResult, RuleContribution, SeverityLevel } from '../types/trishield';

/**
 * Baseline nominal readings to calibrate the Isolation Forest
 */
const NOMINAL_TRAINING_SET = [
  { rssi: -85, neighborCount: 6, encLevel: 3, ta: 4, c2Bias: 0, lacStable: 1 },
  { rssi: -90, neighborCount: 5, encLevel: 3, ta: 6, c2Bias: 0, lacStable: 1 },
  { rssi: -78, neighborCount: 7, encLevel: 3, ta: 3, c2Bias: 0, lacStable: 1 },
  { rssi: -95, neighborCount: 4, encLevel: 3, ta: 8, c2Bias: 0, lacStable: 1 },
  { rssi: -82, neighborCount: 6, encLevel: 3, ta: 5, c2Bias: 2, lacStable: 1 },
  { rssi: -88, neighborCount: 5, encLevel: 3, ta: 7, c2Bias: 0, lacStable: 1 },
  { rssi: -75, neighborCount: 6, encLevel: 3, ta: 2, c2Bias: 0, lacStable: 1 },
  { rssi: -92, neighborCount: 5, encLevel: 3, ta: 9, c2Bias: 0, lacStable: 1 },
  { rssi: -80, neighborCount: 7, encLevel: 3, ta: 4, c2Bias: 1, lacStable: 1 },
  { rssi: -86, neighborCount: 6, encLevel: 3, ta: 5, c2Bias: 0, lacStable: 1 },
  // Occasional natural handover / fringe tower
  { rssi: -98, neighborCount: 3, encLevel: 3, ta: 12, c2Bias: 0, lacStable: 1 },
  { rssi: -72, neighborCount: 6, encLevel: 3, ta: 2, c2Bias: 2, lacStable: 1 },
  { rssi: -84, neighborCount: 5, encLevel: 3, ta: 4, c2Bias: 0, lacStable: 1 },
];

interface IsolationTree {
  splitFeature?: number;
  splitValue?: number;
  left?: IsolationTree;
  right?: IsolationTree;
  size: number;
}

class IsolationForestEngine {
  private trees: IsolationTree[] = [];
  private numTrees = 25;
  private maxDepth = 6;

  constructor() {
    this.train(NOMINAL_TRAINING_SET);
  }

  private train(data: typeof NOMINAL_TRAINING_SET) {
    const matrix = data.map(d => [d.rssi, d.neighborCount, d.encLevel, d.ta, d.c2Bias, d.lacStable]);
    this.trees = [];

    for (let t = 0; t < this.numTrees; t++) {
      this.trees.push(this.buildTree(matrix, 0));
    }
  }

  private buildTree(points: number[][], currentDepth: number): IsolationTree {
    if (points.length <= 1 || currentDepth >= this.maxDepth) {
      return { size: points.length };
    }

    // Pick random feature
    const numFeatures = points[0].length;
    const featureIdx = Math.floor(Math.random() * numFeatures);

    const values = points.map(p => p[featureIdx]);
    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min === max) {
      return { size: points.length };
    }

    // Random split value between min and max
    const splitVal = min + Math.random() * (max - min);

    const left = points.filter(p => p[featureIdx] < splitVal);
    const right = points.filter(p => p[featureIdx] >= splitVal);

    if (left.length === 0 || right.length === 0) {
      return { size: points.length };
    }

    return {
      splitFeature: featureIdx,
      splitValue: splitVal,
      left: this.buildTree(left, currentDepth + 1),
      right: this.buildTree(right, currentDepth + 1),
      size: points.length
    };
  }

  private pathLength(point: number[], node: IsolationTree, depth: number): number {
    if (!node.left || !node.right || node.splitFeature === undefined || node.splitValue === undefined) {
      return depth + this.c(node.size);
    }
    if (point[node.splitFeature] < node.splitValue) {
      return this.pathLength(point, node.left, depth + 1);
    } else {
      return this.pathLength(point, node.right, depth + 1);
    }
  }

  private c(n: number): number {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    // Harmonic number approximation
    const eulerGamma = 0.5772156649;
    return 2 * (Math.log(n - 1) + eulerGamma) - (2 * (n - 1) / n);
  }

  /**
   * Returns anomaly score between 0 and 1
   */
  public score(reading: CellularReading): number {
    const encLevel = reading.encryption.includes('A5/0') ? 0 :
                     reading.encryption.includes('A5/1') ? 1 : 3;
    const lacStable = reading.lac === 40221 || reading.lac === 40222 ? 1 : 0;
    const point = [reading.rssi, reading.neighborCount, encLevel, reading.timingAdvance, reading.c2ReselectionBias, lacStable];

    let totalPath = 0;
    for (const tree of this.trees) {
      totalPath += this.pathLength(point, tree, 0);
    }
    const avgPath = totalPath / this.trees.length;
    const avgC = this.c(NOMINAL_TRAINING_SET.length);
    
    // Anomaly score s = 2 ^ (- avgPath / c(n))
    const s = Math.pow(2, -avgPath / (avgC || 1));
    return Math.max(0, Math.min(1, s));
  }
}

// Singleton isolation forest model
const isolationForest = new IsolationForestEngine();

export interface EngineWeights {
  cipherDowngradeWeight: number; // default 30
  signalAnomalyWeight: number; // default 15
  neighborSuppressionWeight: number; // default 15
  lacAnomalyWeight: number; // default 10
  timingAdvanceWeight: number; // default 10
  isolationForestWeight: number; // default 20
  alertThreshold: number; // default 60
}

export const DEFAULT_WEIGHTS: EngineWeights = {
  cipherDowngradeWeight: 28,
  signalAnomalyWeight: 14,
  neighborSuppressionWeight: 14,
  lacAnomalyWeight: 8,
  timingAdvanceWeight: 6,
  isolationForestWeight: 30,
  alertThreshold: 60
};

/**
 * Executes the full dual-layer detection pipeline on cellular telemetry
 */
export function analyzeReading(
  reading: CellularReading,
  weights: EngineWeights = DEFAULT_WEIGHTS
): DetectionResult {
  const contributions: RuleContribution[] = [];

  // 1. Cipher Downgrade Rule
  let cipherPoints = 0;
  let cipherExplanation = 'Legitimate modern encryption active (LTE/AES-128 or A5/3).';
  let cipherTech = `${reading.encryption} confirmed.`;

  if (reading.encryption.includes('A5/0')) {
    cipherPoints = weights.cipherDowngradeWeight;
    cipherExplanation = 'CRITICAL: Cell forced zero encryption (A5/0 Null Cipher). Cellular traffic is plaintext.';
    cipherTech = 'A5/0 null cipher forced by base station during cipher mode command.';
  } else if (reading.encryption.includes('A5/1')) {
    cipherPoints = Math.round(weights.cipherDowngradeWeight * 0.65);
    cipherExplanation = 'WARNING: Handshake downgraded to vulnerable 1980s 2G A5/1 encryption.';
    cipherTech = 'A5/1 cipher suite negotiated despite 4G LTE coverage present.';
  }

  contributions.push({
    name: 'Cipher Downgrade',
    points: cipherPoints,
    maxPoints: weights.cipherDowngradeWeight,
    triggered: cipherPoints > 0,
    explanation: cipherExplanation,
    technicalDetails: cipherTech
  });

  // 2. Unnatural RF Power Spike & Reselection Bias
  let rfPoints = 0;
  let rfExplanation = 'Signal strength (-' + Math.abs(reading.rssi) + ' dBm) within normal baseline range.';
  let rfTech = `RSSI ${reading.rssi} dBm, C2 offset +${reading.c2ReselectionBias}dB.`;

  if (reading.rssi >= -52 || reading.c2ReselectionBias >= 14) {
    rfPoints = weights.signalAnomalyWeight;
    rfExplanation = 'Aggressive RF power override: tower is shouting over nearby authentic carriers to hijack handsets.';
    rfTech = `Severe RSSI surge (${reading.rssi} dBm) combined with abnormal C2 offset (+${reading.c2ReselectionBias}dB).`;
  } else if (reading.rssi >= -65 || reading.c2ReselectionBias >= 8) {
    rfPoints = Math.round(weights.signalAnomalyWeight * 0.5);
    rfExplanation = 'Elevated broadcast signal strength compared to local geometric baselines.';
    rfTech = `Elevated RSSI ${reading.rssi} dBm with noticeable handoff bias.`;
  }

  contributions.push({
    name: 'Signal Hijack / Power Surge',
    points: rfPoints,
    maxPoints: weights.signalAnomalyWeight,
    triggered: rfPoints > 0,
    explanation: rfExplanation,
    technicalDetails: rfTech
  });

  // 3. Missing Adjacent / Neighbor Cell List Rule
  let neighborPoints = 0;
  let neighborExplanation = `Normal cell topology: Handset sees ${reading.neighborCount} adjacent carrier towers.`;
  let neighborTech = `BCCH Neighbor Cell List (BA) contains ${reading.neighborCount} valid carriers.`;

  if (reading.neighborCount === 0) {
    neighborPoints = weights.neighborSuppressionWeight;
    neighborExplanation = 'SUSPICIOUS: Zero neighbor towers broadcasted. Rogue cell is preventing phone from handing back to legitimate network.';
    neighborTech = 'BA (BCCH Allocation) list is empty. Suppresses cell reselection attempts by victim UE.';
  } else if (reading.neighborCount <= 1) {
    neighborPoints = Math.round(weights.neighborSuppressionWeight * 0.5);
    neighborExplanation = 'Sparse neighbor list reported (isolated island configuration).';
    neighborTech = `Only ${reading.neighborCount} neighbor tower listed.`;
  }

  contributions.push({
    name: 'Neighbor Suppression',
    points: neighborPoints,
    maxPoints: weights.neighborSuppressionWeight,
    triggered: neighborPoints > 0,
    explanation: neighborExplanation,
    technicalDetails: neighborTech
  });

  // 4. LAC Anomaly / Geo-Identity Mismatch
  let lacPoints = 0;
  let lacExplanation = 'Location Area Code (LAC) matches verified local operator database.';
  let lacTech = `LAC: ${reading.lac}, Cell ID: ${reading.cellId}.`;

  const KNOWN_VALID_LACS = [40221, 40222, 40220];
  if (!KNOWN_VALID_LACS.includes(reading.lac) || reading.rejectCause) {
    lacPoints = weights.lacAnomalyWeight;
    lacExplanation = 'Unregistered Location Area Code or forced authentication rejection flag.';
    lacTech = `Unmapped LAC ${reading.lac}${reading.rejectCause ? ` with ${reading.rejectCause}` : ''}.`;
  }

  contributions.push({
    name: 'Identity / LAC Anomaly',
    points: lacPoints,
    maxPoints: weights.lacAnomalyWeight,
    triggered: lacPoints > 0,
    explanation: lacExplanation,
    technicalDetails: lacTech
  });

  // 5. Timing Advance / Physical Distance Inconsistency
  let taPoints = 0;
  let taExplanation = `Timing advance (${reading.timingAdvance}) correlates with expected radio propagation distance.`;
  let taTech = `TA = ${reading.timingAdvance} (~${(reading.timingAdvance * 550 / 1000).toFixed(1)} km physical delay).`;

  // If signal is exceptionally strong (-48 dBm) but TA claims 8-15 (~5-8km), this is impossible physical physics
  if (reading.rssi > -60 && reading.timingAdvance > 7) {
    taPoints = weights.timingAdvanceWeight;
    taExplanation = 'Physical contradiction: Extremely close transmitter pretending to be miles away.';
    taTech = `Propagation contradiction: High RSSI (${reading.rssi} dBm) conflicting with TA=${reading.timingAdvance}.`;
  } else if (reading.timingAdvance === 0 && reading.rssi < -95) {
    taPoints = Math.round(weights.timingAdvanceWeight * 0.5);
    taExplanation = 'Faint signal claiming zero propagation delay.';
    taTech = `TA=0 mismatch with weak RSSI ${reading.rssi} dBm.`;
  }

  contributions.push({
    name: 'Timing Advance Geometry',
    points: taPoints,
    maxPoints: weights.timingAdvanceWeight,
    triggered: taPoints > 0,
    explanation: taExplanation,
    technicalDetails: taTech
  });

  // Layer 2: Isolation Forest Anomaly Engine
  const rawIsoScore = isolationForest.score(reading);
  // Scale raw anomaly score to points
  const isoPoints = Math.round(rawIsoScore * weights.isolationForestWeight);

  // Total Rule Points
  const totalRuleScore = cipherPoints + rfPoints + neighborPoints + lacPoints + taPoints;
  const combinedRisk = Math.min(100, Math.max(0, totalRuleScore + isoPoints));

  let severity: SeverityLevel = 'SAFE';
  let summaryHeadline = 'Authentic Carrier Cell Tower';
  let plainEnglishReason = 'Network behavior matches standard legitimate carrier specifications. Data and calls are securely encrypted.';
  let recommendedAction = 'No action needed. Cell connection is secure.';

  if (combinedRisk >= weights.alertThreshold) {
    severity = 'DANGER';
    summaryHeadline = 'ROGUE CELL TOWER CONFIRMED (IMSI Catcher)';
    plainEnglishReason = reading.encryption.includes('A5/0')
      ? 'An unauthorized base station has forced your device into unencrypted 2G mode to intercept calls, SMS, and subscriber IMSI data.'
      : 'Severe cellular anomalies detected: broadcast spoofing, abnormal power surge, and suppressed neighbor handoffs.';
    recommendedAction = 'Enable Airplane Mode immediately or force LTE/5G-only mode in phone settings. Incident logged for cybercrime reporting.';
  } else if (combinedRisk >= weights.alertThreshold * 0.55) {
    severity = 'CAUTION';
    summaryHeadline = 'Suspicious Cellular Anomaly';
    plainEnglishReason = 'Mild behavioral discrepancies detected (unusual handoff parameters or timing advance delta). System is monitoring.';
    recommendedAction = 'Continue monitoring. Keep 2G disabled in cellular settings.';
  }

  const isAlert = combinedRisk >= weights.alertThreshold;
  const isReportReady = combinedRisk >= Math.min(85, weights.alertThreshold + 10);

  return {
    readingId: reading.id,
    timestamp: reading.timestamp,
    riskScore: combinedRisk,
    severity,
    ruleScore: totalRuleScore,
    isolationForestScore: isoPoints,
    ruleContributions: contributions,
    summaryHeadline,
    plainEnglishReason,
    recommendedAction,
    isAlert,
    isReportReady
  };
}
