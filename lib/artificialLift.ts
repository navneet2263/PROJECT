export interface LiftInputs {
  depth: number; // ft
  ratePotential: number; // STB/day
  gasFraction: number; // fraction 0 to 1
  viscosity: number; // cP
  deviation: number; // degrees
  sandProduction: boolean;
}

export interface LiftRecommendation {
  method: string;
  score: number;
  reasons: string[];
}

export interface LiftResult {
  recommended: LiftRecommendation | null;
  alternatives: LiftRecommendation[];
}

/**
 * recommendArtificialLift evaluates a set of well parameters
 * against heuristic rules to score and recommend artificial lift methods.
 */
export function recommendArtificialLift(inputs: LiftInputs): LiftResult {
  const methods: LiftRecommendation[] = [
    scoreRodPump(inputs),
    scoreGasLift(inputs),
    scoreESP(inputs),
    scorePCP(inputs)
  ];

  // Sort descending by score
  methods.sort((a, b) => b.score - a.score);

  // If the highest score is still 0 or negative, we might not have a great recommendation (edge case)
  const validMethods = methods.filter(m => m.score > 0);

  return {
    recommended: validMethods.length > 0 ? validMethods[0] : null,
    alternatives: validMethods.length > 1 ? validMethods.slice(1) : []
  };
}

function scoreRodPump(inputs: LiftInputs): LiftRecommendation {
  let score = 50; // Base score
  const reasons: string[] = [];

  // Favorable conditions
  if (inputs.depth <= 5000) {
    score += 20;
    reasons.push("Suitable for depth");
  } else if (inputs.depth > 8000) {
    score -= 30; // Deep wells strain rod strings
    reasons.push("Extremely deep for rod pumping");
  }

  if (inputs.ratePotential <= 1000) {
    score += 20;
    reasons.push("Excellent for low/medium rates");
  } else if (inputs.ratePotential > 2500) {
    score -= 40; // Hard to pump very high volumes
    reasons.push("Rate potential too high for standard rod string capacity");
  }

  if (inputs.deviation > 30) {
    score -= 40; // Rod wear on tubing
    reasons.push("High deviation causes severe rod/tubing wear");
  } else if (inputs.deviation === 0) {
    score += 10;
    reasons.push("Perfectly vertical well");
  }

  if (inputs.gasFraction > 0.4) {
    score -= 20; // Gas interference / gas lock
    reasons.push("High gas fraction increases risk of gas lock");
  }

  if (inputs.sandProduction) {
    score -= 40; // Pump wear
    reasons.push("Sand production causes rapid pump wear");
  }

  return { method: "Rod Pump", score: Math.max(0, score), reasons };
}

function scoreGasLift(inputs: LiftInputs): LiftRecommendation {
  let score = 50;
  const reasons: string[] = [];

  if (inputs.gasFraction > 0.3) {
    score += 30;
    reasons.push("High free gas aids system naturally");
  }

  if (inputs.deviation > 45) {
    score += 20;
    reasons.push("Excellent for highly deviated/horizontal wells");
  }

  if (inputs.sandProduction) {
    score += 20;
    reasons.push("Tolerates sand/solids well");
  }

  if (inputs.ratePotential > 1000 && inputs.ratePotential < 10000) {
    score += 20;
    reasons.push("Highly flexible rate capacity");
  }

  if (inputs.viscosity > 100) {
    score -= 30; // Gas bypasses thick oil
    reasons.push("High viscosity reduces lifting efficiency");
  }

  return { method: "Gas Lift", score: Math.max(0, score), reasons };
}

function scoreESP(inputs: LiftInputs): LiftRecommendation {
  let score = 50;
  const reasons: string[] = [];

  if (inputs.ratePotential >= 2000) {
    score += 40;
    reasons.push("Excellent for high volume production");
  } else if (inputs.ratePotential < 500) {
    score -= 30;
    reasons.push("Rates too low for efficient ESP cooling/operation");
  }

  if (inputs.depth > 2000) {
    score += 10;
    reasons.push("Suitable for deep lift applications");
  }

  if (inputs.gasFraction > 0.3) {
    score -= 30; // Gas locking the pump
    reasons.push("High gas fraction degrades pump performance");
  } else {
    score += 10;
    reasons.push("Low free gas is ideal");
  }

  if (inputs.sandProduction) {
    score -= 20; // Erosion
    reasons.push("Sand causes severe impeller erosion");
  }

  return { method: "Electrical Submersible Pump (ESP)", score: Math.max(0, score), reasons };
}

function scorePCP(inputs: LiftInputs): LiftRecommendation {
  let score = 50;
  const reasons: string[] = [];

  if (inputs.viscosity > 100) {
    score += 40;
    reasons.push("Excellent for high viscosity / heavy oil");
  }

  if (inputs.sandProduction) {
    score += 30;
    reasons.push("Handles sand and abrasives very well");
  }

  if (inputs.depth > 6000) {
    score -= 40; // Elastomer temp limits and rod torque
    reasons.push("Too deep (temperature and torque constraints)");
  } else if (inputs.depth < 3000) {
    score += 10;
    reasons.push("Ideal depth range");
  }

  if (inputs.ratePotential > 3000) {
    score -= 30;
    reasons.push("Rate potential exceeds typical PCP limits");
  }

  if (inputs.gasFraction > 0.2) {
    score -= 30; // Stator damage from dry running / swelling
    reasons.push("Gas causes elastomer damage and poor efficiency");
  }

  return { method: "Progressing Cavity Pump (PCP)", score: Math.max(0, score), reasons };
}

/** All inputs SI: pressure Pa, pressure_per_length Pa/m. Returns depth m. */
export interface GasLiftDepthInputSI {
  tubingHeadPa: number;
  liquidGradientPaPerM: number;
  gasGradientPaPerM: number;
  targetDrawdownPa: number;
}

export function gasLiftInjectionDepthSI(input: GasLiftDepthInputSI): number {
  const { tubingHeadPa, liquidGradientPaPerM, gasGradientPaPerM, targetDrawdownPa } = input;
  if (liquidGradientPaPerM <= gasGradientPaPerM) return 0;
  const depth = (tubingHeadPa + targetDrawdownPa) / (liquidGradientPaPerM - gasGradientPaPerM);
  return Math.max(0, depth);
}

/** Head per stage in m, stages dimensionless, sg dimensionless. Returns head m, pressure Pa = rho*g*h. */
export interface ESPHeadInputSI {
  stages: number;
  headPerStageM: number;
  sg: number;
}

const RHO_WATER = 1000;

export function espHeadSI(input: ESPHeadInputSI): number {
  const { stages, headPerStageM } = input;
  return stages * headPerStageM;
}

export function espPressureSI(input: ESPHeadInputSI): number {
  const headM = espHeadSI(input);
  const { sg } = input;
  return RHO_WATER * sg * 9.80665 * headM;
}

