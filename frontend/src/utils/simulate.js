// Frontend-only simulation helper.
//
// This does NOT call the real AI/ML model or change any backend logic.
// It generates a fake traffic sample and randomly decides whether it
// "looks" malicious, purely so the dashboard has a Simulate Intrusion
// button to demo for the prototype. When it decides an intrusion
// happened, it posts to the EXISTING POST /api/alerts endpoint so the
// alert shows up in the normal alerts list/stats, exactly as if a real
// detection had come in.

const PROTOCOLS = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS"];

const ATTACK_TYPES = [
  "DDoS",
  "Port Scan",
  "Brute Force",
  "SQL Injection",
  "Man-in-the-Middle",
  "Botnet",
  "Malware",
];

// Chance that a simulated run is flagged as an intrusion (used when no
// specific attack type is requested).
const INTRUSION_PROBABILITY = 0.6;

// Maps the Dashboard "attack type" select to a simulated outcome.
const ATTACK_KEY_MAP = {
  benign: null, // never flagged
  ddos: "DDoS",
  doshulk: "DoS Hulk",
  bruteforce: "Brute Force",
  portscan: "Port Scan",
};

function randomIP() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 254) + 1).join(".");
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function severityFromConfidence(confidence) {
  if (confidence >= 90) return "Critical";
  if (confidence >= 75) return "High";
  if (confidence >= 55) return "Medium";
  return "Low";
}

/**
 * Runs one simulated traffic check.
 * Returns:
 *  { detected: false, sample: { sourceIP, destinationIP, protocol, confidence } }
 *  { detected: true,  sample: { sourceIP, destinationIP, protocol, confidence, attackType, severity, status } }
 */
export function runSimulatedScan(attackKey) {
  const hasKnownKey = attackKey && Object.prototype.hasOwnProperty.call(ATTACK_KEY_MAP, attackKey);
  const forcedAttackType = hasKnownKey ? ATTACK_KEY_MAP[attackKey] : undefined;

  // "benign" is forced clean; any other known key is forced detected so the
  // select box on the Dashboard behaves predictably during a demo.
  const confidence = hasKnownKey
    ? forcedAttackType
      ? Math.floor(Math.random() * 45) + 55 // 55–99
      : Math.floor(Math.random() * 40) + 1 // 1–40, clearly "clean"
    : Math.floor(Math.random() * 100) + 1;

  const detected = hasKnownKey ? Boolean(forcedAttackType) : Math.random() < INTRUSION_PROBABILITY;

  const base = {
    sourceIP: randomIP(),
    destinationIP: randomIP(),
    protocol: pick(PROTOCOLS),
    confidence,
  };

  if (!detected) {
    return { detected: false, sample: base };
  }

  return {
    detected: true,
    sample: {
      ...base,
      attackType: forcedAttackType || pick(ATTACK_TYPES),
      severity: severityFromConfidence(confidence),
      status: "Active",
    },
  };
}
