/** All inputs SI: density kg/m³, length m, pressure Pa. Returns pressure Pa. */
export interface HydrostaticInputSI {
  densityKgM3: number;
  tvdM: number;
}

const G = 9.80665;

export function hydrostaticPressureSI(input: HydrostaticInputSI): number {
  const { densityKgM3, tvdM } = input;
  return densityKgM3 * G * tvdM;
}

export interface KillMudInputSI {
  currentDensityKgM3: number;
  sidppPa: number;
  tvdM: number;
}

export function killMudWeightSI(input: KillMudInputSI): number {
  const { currentDensityKgM3, sidppPa, tvdM } = input;
  return currentDensityKgM3 + sidppPa / (G * tvdM);
}

export interface ECDInputSI {
  densityKgM3: number;
  annularPressureLossPa: number;
  tvdM: number;
}

export function ecdSI(input: ECDInputSI): number {
  const { densityKgM3, annularPressureLossPa, tvdM } = input;
  return densityKgM3 + annularPressureLossPa / (G * tvdM);
}

export interface MAASPInputSI {
  shoeTvdM: number;
  maxDensityKgM3: number;
  currentDensityKgM3: number;
}

export function maaspSI(input: MAASPInputSI): number {
  const { shoeTvdM, maxDensityKgM3, currentDensityKgM3 } = input;
  return shoeTvdM * G * (maxDensityKgM3 - currentDensityKgM3);
}
