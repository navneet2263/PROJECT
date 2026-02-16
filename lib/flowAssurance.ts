/** All inputs SI: length m, flowrate m³/s, viscosity Pa·s, density kg/m³. Roughness m. Returns pressure drop Pa. */
export interface PipelinePressureDropInputSI {
  lengthM: number;
  diameterM: number;
  rateM3S: number;
  viscosityPaS: number;
  densityKgM3: number;
  roughnessM?: number;
}

export function pipelinePressureDropSI(input: PipelinePressureDropInputSI): number {
  const { lengthM, diameterM, rateM3S, viscosityPaS, densityKgM3, roughnessM = 0.0000457 } = input;
  const areaM2 = Math.PI * (diameterM / 2) ** 2;
  const velMS = rateM3S / areaM2;
  const re = (densityKgM3 * velMS * diameterM) / viscosityPaS;
  const f = re < 2100 ? 64 / re : 0.316 * Math.pow(re, -0.25);
  const dP = (f * (lengthM / diameterM) * densityKgM3 * velMS * velMS) / 2;
  return Math.max(0, dP);
}

/** Diameter m, densities kg/m³, viscosity Pa·s. Returns critical velocity m/s. */
export interface CriticalVelocityInputSI {
  diameterM: number;
  densityKgM3: number;
  viscosityPaS: number;
  particleDensityKgM3?: number;
}

export function criticalVelocitySI(input: CriticalVelocityInputSI): number {
  const { diameterM, densityKgM3, particleDensityKgM3 = 2650 } = input;
  const g = 9.80665;
  const vc = 1.34 * Math.sqrt(2 * g * diameterM * (particleDensityKgM3 - densityKgM3) / densityKgM3);
  return Math.max(0, vc);
}
