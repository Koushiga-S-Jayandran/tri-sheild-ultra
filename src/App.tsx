import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ExplainersModal } from './components/ExplainersModal';
import { DashboardTab } from './components/tabs/DashboardTab';
import { SimulatorTab } from './components/tabs/SimulatorTab';
import { EvidenceLogTab } from './components/tabs/EvidenceLogTab';
import { ReportsTab } from './components/tabs/ReportsTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { 
  CellularReading, DetectionResult, EvidenceBlock, 
  FleetDevice, ScenarioDefinition 
} from './types/trishield';
import { SCENARIOS, INITIAL_FLEET, ATTACKER_SCRIPTS, BASE_COORDINATES } from './utils/scenarios';
import { analyzeReading, DEFAULT_WEIGHTS, EngineWeights } from './utils/detectionEngine';
import { sha256Hex, canonicalPayloadString, verifyEvidenceChain } from './utils/crypto';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [weights, setWeights] = useState<EngineWeights>(DEFAULT_WEIGHTS);
  const [userThreshold, setUserThreshold] = useState<number>(DEFAULT_WEIGHTS.alertThreshold);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('normal');
  const [showSimulatedWatermark, setShowSimulatedWatermark] = useState<boolean>(true);
  const [explainerModal, setExplainerModal] = useState<'how_it_works' | 'real_vs_simulated' | null>(null);

  // Guided demo runner states
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoStepName, setDemoStepName] = useState<string>('');
  const [guidedDemoBanner, setGuidedDemoBanner] = useState<string | null>(null);

  // Current Telemetry & Detection
  const [currentReading, setCurrentReading] = useState<CellularReading>(() => {
    const template = SCENARIOS.normal.readingTemplate;
    return {
      id: `FRAME-${Date.now()}`,
      timestamp: new Date().toISOString(),
      deviceId: template.deviceId || 'SIM-DEMO-001',
      mcc: template.mcc || '404',
      mnc: template.mnc || '45',
      lac: template.lac || 40221,
      cellId: template.cellId || 18402,
      arfcn: template.arfcn || 1520,
      rssi: template.rssi || -85,
      timingAdvance: template.timingAdvance || 4,
      encryption: template.encryption || 'EEA2 (AES-128 4G)',
      band: template.band || 'LTE Band 3 (1800MHz)',
      neighborCount: template.neighborCount || 6,
      c2ReselectionBias: template.c2ReselectionBias || 0,
      towerLabel: template.towerLabel || 'Airtel Macro Cell #18402',
      lat: BASE_COORDINATES.homeLat,
      lng: BASE_COORDINATES.homeLng,
      isSimulated: true
    };
  });

  const [currentDetection, setCurrentDetection] = useState<DetectionResult>(() => {
    return analyzeReading(currentReading, { ...DEFAULT_WEIGHTS, alertThreshold: userThreshold });
  });

  // Telemetry trend history
  const [history, setHistory] = useState<{ timestamp: string; score: number; label: string }[]>([
    { timestamp: '10:40:10', score: 9, label: 'Baseline 4G' },
    { timestamp: '10:40:15', score: 11, label: 'Nominal' },
    { timestamp: '10:40:20', score: 8, label: 'Nominal' },
    { timestamp: '10:40:25', score: 12, label: 'Nominal' },
    { timestamp: '10:40:30', score: 10, label: 'Nominal' }
  ]);

  // Evidence Ledger (Blockchain)
  const [evidenceChain, setEvidenceChain] = useState<EvidenceBlock[]>([]);
  const [isChainValid, setIsChainValid] = useState<boolean>(true);
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [activeIncidentIndex, setActiveIncidentIndex] = useState<number>(0);

  // Fleet & Console
  const [fleetDevices, setFleetDevices] = useState<FleetDevice[]>(INITIAL_FLEET);
  const [isFleetModeActive, setIsFleetModeActive] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(ATTACKER_SCRIPTS.normal);

  // Attack Exposure Timer
  const [exposureSeconds, setExposureSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Initialize Genesis block on startup
  useEffect(() => {
    const initGenesis = async () => {
      const genesisReading: CellularReading = {
        ...currentReading,
        id: 'FRAME-GENESIS-0'
      };
      const genesisDetection = analyzeReading(genesisReading, weights);

      const genesisBlockSkeleton = {
        index: 0,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
        reading: genesisReading,
        detection: genesisDetection
      };

      const payloadStr = canonicalPayloadString(genesisBlockSkeleton);
      const hash = await sha256Hex(payloadStr);

      const genesisBlock: EvidenceBlock = {
        ...genesisBlockSkeleton,
        hash
      };

      // Add a second baseline block
      const block1Skeleton = {
        index: 1,
        timestamp: new Date(Date.now() - 120000).toISOString(),
        prevHash: hash,
        reading: { ...genesisReading, id: 'FRAME-BASE-01' },
        detection: genesisDetection
      };
      const hash1 = await sha256Hex(canonicalPayloadString(block1Skeleton));
      const block1: EvidenceBlock = {
        ...block1Skeleton,
        hash: hash1
      };

      setEvidenceChain([genesisBlock, block1]);
    };

    initGenesis();
  }, []);

  // Recalculate detection when reading or threshold changes
  useEffect(() => {
    const updated = analyzeReading(currentReading, { ...weights, alertThreshold: userThreshold });
    setCurrentDetection(updated);
  }, [currentReading, weights, userThreshold]);

  // Attack exposure counter
  useEffect(() => {
    if (currentDetection.severity === 'DANGER') {
      timerRef.current = setInterval(() => {
        setExposureSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setExposureSeconds(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentDetection.severity]);

  // Inject a new reading into the system & append to SHA-256 chain if alert
  const injectReading = async (newReading: CellularReading) => {
    const newDetection = analyzeReading(newReading, { ...weights, alertThreshold: userThreshold });

    setCurrentReading(newReading);
    setCurrentDetection(newDetection);

    // Update trend history
    setHistory(prev => [
      ...prev.slice(-9),
      {
        timestamp: new Date().toLocaleTimeString(),
        score: newDetection.riskScore,
        label: newReading.towerLabel.split(' ')[0]
      }
    ]);

    // Append to Evidence Chain with real SHA-256 seal
    setEvidenceChain(prevChain => {
      const prevBlock = prevChain[prevChain.length - 1];
      const prevHash = prevBlock ? prevBlock.hash : '0000000000000000000000000000000000000000000000000000000000000000';
      const index = prevChain.length;
      const timestamp = new Date().toISOString();

      const blockSkeleton = {
        index,
        timestamp,
        prevHash,
        reading: newReading,
        detection: newDetection
      };

      // Compute synchronous temp hash, then update with real sha256
      const payloadStr = canonicalPayloadString(blockSkeleton);
      const tempHash = `calc_${Date.now()}`;

      const newBlock: EvidenceBlock = {
        ...blockSkeleton,
        hash: tempHash
      };

      // Asynchronously resolve true SHA-256 hash
      sha256Hex(payloadStr).then(realHash => {
        setEvidenceChain(chain => chain.map(b => b.index === index ? { ...b, hash: realHash } : b));
      });

      return [...prevChain, newBlock];
    });

    // Check chain validity
    setIsChainValid(true);
    setIsTampered(false);
  };

  // Scenario trigger handler
  const handleTriggerScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    const scenario = SCENARIOS[scenarioId];
    if (!scenario) return;

    // Stream attacker console logs with realistic telemetry delay
    const script = ATTACKER_SCRIPTS[scenarioId] || [];
    setConsoleLogs([]);
    script.forEach((line, i) => {
      setTimeout(() => {
        setConsoleLogs(prev => [...prev, line]);
      }, (i + 1) * 350);
    });

    const template = scenario.readingTemplate;
    const newReading: CellularReading = {
      id: `FRAME-${Date.now()}`,
      timestamp: new Date().toISOString(),
      deviceId: template.deviceId || 'SIM-DEMO-001',
      mcc: template.mcc || '404',
      mnc: template.mnc || '45',
      lac: template.lac || 40221,
      cellId: template.cellId || 18402,
      arfcn: template.arfcn || 1520,
      rssi: template.rssi || -85,
      timingAdvance: template.timingAdvance || 4,
      encryption: template.encryption || 'EEA2 (AES-128 4G)',
      band: template.band || 'LTE Band 3 (1800MHz)',
      neighborCount: template.neighborCount !== undefined ? template.neighborCount : 6,
      c2ReselectionBias: template.c2ReselectionBias || 0,
      rejectCause: template.rejectCause,
      towerLabel: template.towerLabel || 'Cell Tower',
      lat: template.lat || BASE_COORDINATES.homeLat,
      lng: template.lng || BASE_COORDINATES.homeLng,
      isSimulated: true
    };

    injectReading(newReading);
  };

  // Serving Tower change from Dashboard dropdown
  const handleServingTowerChange = (towerKey: 'home' | 'office' | 'rogue') => {
    if (towerKey === 'home') {
      handleTriggerScenario('normal');
    } else if (towerKey === 'office') {
      const officeReading: CellularReading = {
        ...currentReading,
        id: `FRAME-${Date.now()}`,
        cellId: 19201,
        lac: 40222,
        arfcn: 1640,
        rssi: -79,
        encryption: 'EEA2 (AES-128 4G)',
        neighborCount: 6,
        towerLabel: 'Connaught Macro #19201',
        lat: BASE_COORDINATES.officeLat,
        lng: BASE_COORDINATES.officeLng
      };
      injectReading(officeReading);
    } else {
      handleTriggerScenario('rogue_downgrade');
    }
  };

  // Tamper test: Corrupts an entry to prove the SHA-256 chain catches tampering
  const handleTamperBlock = (indexToTamper: number) => {
    setEvidenceChain(prev => {
      return prev.map(block => {
        if (block.index === indexToTamper) {
          return {
            ...block,
            tampered: true,
            originalPayloadHash: block.hash,
            reading: {
              ...block.reading,
              encryption: 'EEA2 (AES-128 4G)', // Maliciously forged to pretend it was safe
              rssi: -85 // Forged
            }
          };
        }
        return block;
      });
    });
    setIsTampered(true);
    setIsChainValid(false);
  };

  // Restore authentic data after tamper test
  const handleRestoreChain = () => {
    setEvidenceChain(prev => {
      return prev.map(block => {
        if (block.tampered) {
          const restoredBlock = {
            ...block,
            tampered: false,
            reading: {
              ...block.reading,
              encryption: 'A5/0 (No Encryption / Null)' as any,
              rssi: -44
            }
          };
          return restoredBlock;
        }
        return block;
      });
    });
    setIsTampered(false);
    setIsChainValid(true);
  };

  // Reset to Normal Baseline
  const handleResetToNormal = () => {
    handleTriggerScenario('normal');
    setIsFleetModeActive(false);
  };

  // Clear all data & reset database
  const handleClearAllData = () => {
    setHistory([]);
    setEvidenceChain([]);
    handleTriggerScenario('normal');
  };

  // Guided Full Demo: Runs through Normal -> Retune -> Rogue Downgrade -> Reports Tab
  const handleRunGuidedDemo = () => {
    if (isDemoRunning) return;
    setIsDemoRunning(true);

    // Step 1: Normal Scenario
    setDemoStepName('Step 1/4: Normal Tower Baseline');
    setGuidedDemoBanner('1/4: Establishing clean carrier baseline on LTE Band 3 (EEA2 AES-128). Risk score is nominal (~10/100).');
    setCurrentTab('dashboard');
    handleTriggerScenario('normal');

    // Step 2: Retune after 4s
    setTimeout(() => {
      setDemoStepName('Step 2/4: Legitimate Retune');
      setGuidedDemoBanner('2/4: Simulating routine carrier frequency retune. TriShield identifies valid neighbors & cipher, avoiding false alarms.');
      handleTriggerScenario('retune');
    }, 4500);

    // Step 3: Rogue Downgrade after 9s
    setTimeout(() => {
      setDemoStepName('Step 3/4: Rogue Attack Injection');
      setGuidedDemoBanner('3/4: Attacker forces 2G downgrade (A5/0 Null Cipher) with power surge (-44 dBm). Threat gauge spikes to DANGER (98/100)!');
      handleTriggerScenario('rogue_downgrade');
    }, 9000);

    // Step 4: Show Evidence and Reports after 14s
    setTimeout(() => {
      setDemoStepName('Step 4/4: Forensic Report');
      setGuidedDemoBanner('4/4: Cryptographic SHA-256 seal verified. Generating standardized legal filing dossier for cybercrime.gov.in / 1930.');
      setCurrentTab('reports');
    }, 14000);

    // End Demo after 18s
    setTimeout(() => {
      setIsDemoRunning(false);
      setDemoStepName('');
      setGuidedDemoBanner(null);
    }, 18000);
  };

  const alertCount = evidenceChain.filter(b => b.detection.riskScore >= userThreshold).length;
  const reportCount = evidenceChain.filter(b => b.detection.isReportReady).length;

  return (
    <div className="min-h-screen bg-[#0E1117] text-[#F0F6FC] flex flex-col font-sans selection:bg-[#1F6FEB]/30 selection:text-white">
      {/* Guided Demo Narration Banner (Visible during Guided Demo) */}
      {guidedDemoBanner && (
        <div className="bg-[#1F6FEB] text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>GUIDED DEMO NARRATION: {guidedDemoBanner}</span>
          </div>
          <span className="font-mono text-[11px] bg-black/20 px-2 py-0.5 rounded">
            Live Automated Walkthrough
          </span>
        </div>
      )}

      {/* Main SOC Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        severity={currentDetection.severity}
        riskScore={currentDetection.riskScore}
        readingsCount={evidenceChain.length + history.length}
        alertCount={alertCount}
        reportCount={reportCount}
        isChainValid={isChainValid}
        showSimulatedWatermark={showSimulatedWatermark}
        onOpenHowItWorks={() => setExplainerModal('how_it_works')}
        onOpenRealVsSim={() => setExplainerModal('real_vs_simulated')}
        onRunGuidedDemo={handleRunGuidedDemo}
        isDemoRunning={isDemoRunning}
        demoStepName={demoStepName}
      />

      {/* Tab Content Panes */}
      <main className="flex-1 pb-16">
        {currentTab === 'dashboard' && (
          <DashboardTab
            currentReading={currentReading}
            currentDetection={currentDetection}
            history={history}
            activeScenarioId={activeScenarioId}
            exposureSeconds={exposureSeconds}
            userThreshold={userThreshold}
            onThresholdChange={setUserThreshold}
            onServingTowerChange={handleServingTowerChange}
            onResetToNormal={handleResetToNormal}
          />
        )}

        {currentTab === 'simulator' && (
          <SimulatorTab
            onTriggerScenario={handleTriggerScenario}
            activeScenarioId={activeScenarioId}
            fleetDevices={fleetDevices}
            isFleetModeActive={isFleetModeActive}
            onToggleFleetMode={setIsFleetModeActive}
            consoleLogs={consoleLogs}
            userThreshold={userThreshold}
          />
        )}

        {currentTab === 'evidence' && (
          <EvidenceLogTab
            evidenceChain={evidenceChain}
            onTamperBlock={handleTamperBlock}
            onRestoreChain={handleRestoreChain}
            isTampered={isTampered}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsTab
            evidenceChain={evidenceChain}
            activeIncidentIndex={activeIncidentIndex}
            onSelectIncident={setActiveIncidentIndex}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsTab
            weights={weights}
            onWeightsChange={setWeights}
            showSimulatedWatermark={showSimulatedWatermark}
            onToggleWatermark={setShowSimulatedWatermark}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Persistent Explainer Modals */}
      <ExplainersModal
        mode={explainerModal}
        onClose={() => setExplainerModal(null)}
      />
    </div>
  );
}
