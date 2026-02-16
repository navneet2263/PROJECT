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
