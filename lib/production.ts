const SECONDS_PER_DAY = 86400;
const STB_TO_M3 = 0.158987;
const PSI_TO_PA = 6894.76;
const MD_TO_M2 = 9.86923e-16;
const CP_TO_PA_S = 0.001;
const FT_TO_M = 0.3048;
const M_TO_FT = 1 / FT_TO_M;

export const PI_SI_TO_STB_D_PSI = (SECONDS_PER_DAY / STB_TO_M3) * PSI_TO_PA;

/** All inputs SI: flowrate m³/s, pressure Pa. Returns PI in (m³/s)/Pa. */
export interface ProductivityIndexInputSI {
  qM3S: number;
  pwfPa: number;
  prPa: number;
}

export function productivityIndexSI(input: ProductivityIndexInputSI): number {
  const { qM3S, pwfPa, prPa } = input;
  if (prPa <= pwfPa) return 0;
  return qM3S / (prPa - pwfPa);
}

/** Porosity from pore and bulk volumes (SI m³). */
export interface PorosityInputSI {
  bulkVolumeM3: number;
  poreVolumeM3: number;
}

export interface PorosityResult {
  phiFraction: number;
  phiPercent: number;
}

export function porosityFromVolumesSI(input: PorosityInputSI): PorosityResult {
  const { bulkVolumeM3, poreVolumeM3 } = input;
  const phiFraction = bulkVolumeM3 > 0 ? poreVolumeM3 / bulkVolumeM3 : 0;
  return {
    phiFraction,
    phiPercent: phiFraction * 100,
  };
}

interface ProductivityIndexBaseInputSI {
  permeabilityM2: number;
  thicknessM: number;
  viscosityPaS: number;
  formationVolumeFactorRBPerSTB: number;
}

export interface ProductivityIndexRadialSteadyInputSI extends ProductivityIndexBaseInputSI {
  drainageRadiusM: number;
  wellboreRadiusM: number;
}

export interface ProductivityIndexRadialTransientInputSI extends ProductivityIndexBaseInputSI {
  drainageRadiusM: number;
  wellboreRadiusM: number;
}

export interface ProductivityIndexRadialPseudoSteadyInputSI extends ProductivityIndexBaseInputSI {
  drainageRadiusM: number;
  wellboreRadiusM: number;
  skinFactor: number;
}

export interface ProductivityIndexHorizontalWellInputSI extends ProductivityIndexBaseInputSI {
  horizontalLengthM: number;
  wellboreRadiusM: number;
}

export interface ProductivityIndexFracturedWellInputSI extends ProductivityIndexBaseInputSI {
  drainageRadiusM: number;
  fractureHalfLengthM: number;
}

function toFieldUnitsFromSI(base: ProductivityIndexBaseInputSI) {
  const kMd = base.permeabilityM2 / MD_TO_M2;
  const hFt = base.thicknessM * M_TO_FT;
  const muCp = base.viscosityPaS / CP_TO_PA_S;
  const bo = base.formationVolumeFactorRBPerSTB;
  return { kMd, hFt, muCp, bo };
}

export function productivityIndexRadialSteadyPISI(input: ProductivityIndexRadialSteadyInputSI): number {
  const { kMd, hFt, muCp, bo } = toFieldUnitsFromSI(input);
  const reFt = input.drainageRadiusM * M_TO_FT;
  const rwFt = input.wellboreRadiusM * M_TO_FT;
  const numerator = 0.00708 * kMd * hFt;
  const denominator = muCp * bo * Math.log(reFt / rwFt);
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

export function productivityIndexRadialTransientPISI(input: ProductivityIndexRadialTransientInputSI): number {
  const { kMd, hFt, muCp, bo } = toFieldUnitsFromSI(input);
  const reFt = input.drainageRadiusM * M_TO_FT;
  const rwFt = input.wellboreRadiusM * M_TO_FT;
  const numerator = 0.00708 * kMd * hFt;
  const denominator = muCp * bo * Math.log((0.472 * reFt * reFt) / (rwFt * rwFt));
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

export function productivityIndexRadialPseudoSteadyPISI(input: ProductivityIndexRadialPseudoSteadyInputSI): number {
  const { kMd, hFt, muCp, bo } = toFieldUnitsFromSI(input);
  const reFt = input.drainageRadiusM * M_TO_FT;
  const rwFt = input.wellboreRadiusM * M_TO_FT;
  const numerator = 0.00708 * kMd * hFt;
  const denominator = muCp * bo * (Math.log(reFt / rwFt) - 0.75 + input.skinFactor);
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

export function productivityIndexHorizontalWellPISI(input: ProductivityIndexHorizontalWellInputSI): number {
  const { kMd, hFt, muCp, bo } = toFieldUnitsFromSI(input);
  const lwFt = input.horizontalLengthM * M_TO_FT;
  const rwFt = input.wellboreRadiusM * M_TO_FT;
  const numerator = 0.00708 * kMd * hFt;
  const denominator = muCp * bo * Math.log((4 * lwFt) / (Math.PI * rwFt));
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

export function productivityIndexFracturedWellPISI(input: ProductivityIndexFracturedWellInputSI): number {
  const { kMd, hFt, muCp, bo } = toFieldUnitsFromSI(input);
  const reFt = input.drainageRadiusM * M_TO_FT;
  const xfFt = input.fractureHalfLengthM * M_TO_FT;
  const numerator = 0.00708 * kMd * hFt;
  const denominator = muCp * bo * Math.log(reFt / xfFt);
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

// ─────────────────────────────────────────────────────────────────────────────
// IPR (Inflow Performance Relationship) Models
// All return { pwfPa, qM3S }[] for plotting. SI inputs.
// ─────────────────────────────────────────────────────────────────────────────

export interface IPRPointSI {
  pwfPa: number;
  qM3S: number;
}

/** Linear IPR (single-phase oil): Q = J * (Pr − Pwf). J in (m³/s)/Pa. */
export function linearIPR(prPa: number, jSI: number, steps = 30): IPRPointSI[] {
  const curve: IPRPointSI[] = [];
  if (prPa <= 0 || jSI <= 0) return curve;
  for (let i = 0; i <= steps; i++) {
    const pwfPa = (prPa * (steps - i)) / steps;
    const qM3S = jSI * (prPa - pwfPa);
    curve.push({ pwfPa, qM3S: Math.max(0, qM3S) });
  }
  return curve;
}

/** Vogel IPR (solution-gas drive): Q/Qmax = 1 − 0.2(Pwf/Pr) − 0.8(Pwf/Pr)² */
export function vogelIPR(prPa: number, qMaxM3S: number, steps = 30): IPRPointSI[] {
  const curve: IPRPointSI[] = [];
  if (prPa <= 0 || qMaxM3S <= 0) return curve;
  for (let i = 0; i <= steps; i++) {
    const pwfPa = (prPa * (steps - i)) / steps;
    const qM3S = pwfPa >= prPa ? 0 : qMaxM3S * (1 - 0.2 * (pwfPa / prPa) - 0.8 * Math.pow(pwfPa / prPa, 2));
    curve.push({ pwfPa, qM3S });
  }
  return curve;
}

/** Gas IPR (pressure-squared): Q = Qmax * (1 − (Pwf/Pr)²) */
export function gasIPRPressureSquared(prPa: number, qMaxM3S: number, steps = 30): IPRPointSI[] {
  const curve: IPRPointSI[] = [];
  if (prPa <= 0 || qMaxM3S <= 0) return curve;
  for (let i = 0; i <= steps; i++) {
    const pwfPa = (prPa * (steps - i)) / steps;
    const qM3S = pwfPa >= prPa ? 0 : qMaxM3S * (1 - Math.pow(pwfPa / prPa, 2));
    curve.push({ pwfPa, qM3S });
  }
  return curve;
}

/** Gas IPR (pseudopressure): Q ∝ m(Pr) − m(Pwf). Uses p² approximation: m(p) ∝ p². */
export function gasIPRPseudopressure(prPa: number, qMaxM3S: number, steps = 30): IPRPointSI[] {
  return gasIPRPressureSquared(prPa, qMaxM3S, steps);
}

/** Fetkovich IPR: Q = Qmax * (1 − (Pwf/Pr)²)^n */
export function fetkovichIPR(prPa: number, qMaxM3S: number, nExponent: number, steps = 30): IPRPointSI[] {
  const curve: IPRPointSI[] = [];
  if (prPa <= 0 || qMaxM3S <= 0 || nExponent <= 0) return curve;
  for (let i = 0; i <= steps; i++) {
    const pwfPa = (prPa * (steps - i)) / steps;
    const qM3S = pwfPa >= prPa ? 0 : qMaxM3S * Math.pow(1 - Math.pow(pwfPa / prPa, 2), nExponent);
    curve.push({ pwfPa, qM3S });
  }
  return curve;
}

/** Horizontal well IPR: Q = J * (Pr − Pwf) with Joshi J. */
export function horizontalWellIPR(
  prPa: number,
  input: ProductivityIndexHorizontalWellInputSI,
  steps = 30
): IPRPointSI[] {
  const j = productivityIndexHorizontalWellPISI(input);
  const jSI = j / PI_SI_TO_STB_D_PSI;
  return linearIPR(prPa, jSI, steps);
}

/** Fractured well IPR: Q = J * (Pr − Pwf) with fractured well J. */
export function fracturedWellIPR(
  prPa: number,
  input: ProductivityIndexFracturedWellInputSI,
  steps = 30
): IPRPointSI[] {
  const j = productivityIndexFracturedWellPISI(input);
  const jSI = j / PI_SI_TO_STB_D_PSI;
  return linearIPR(prPa, jSI, steps);
}

/** Point rate for Vogel at given Pwf. */
export function vogelIPRSI(prPa: number, pwfPa: number, qMaxM3S: number): number {
  if (pwfPa >= prPa) return 0;
  return qMaxM3S * (1 - 0.2 * (pwfPa / prPa) - 0.8 * Math.pow(pwfPa / prPa, 2));
}

export interface VogelIPRCurveInputSI {
  prPa: number;
  qMaxM3S: number;
}

/** @deprecated Use vogelIPR instead. */
export function vogelIPRCurveSI(input: VogelIPRCurveInputSI, steps = 20): IPRPointSI[] {
  return vogelIPR(input.prPa, input.qMaxM3S, steps);
}

export interface CoreyRelPermParams {
  swc: number;
  sor: number;
  kroEnd: number;
  krwEnd: number;
  no: number;
  nw: number;
}

export interface CoreyRelPermPoint {
  sw: number;
  kro: number;
  krw: number;
}

export function coreyEffectiveWaterSaturation(sw: number, swc: number, sor: number): number {
  const denom = 1 - swc - sor;
  if (denom <= 0) return 0;
  const swEff = (sw - swc) / denom;
  if (swEff < 0) return 0;
  if (swEff > 1) return 1;
  return swEff;
}

export function coreyRelPermAtSw(sw: number, params: CoreyRelPermParams): { swEff: number; kro: number; krw: number } {
  const swEff = coreyEffectiveWaterSaturation(sw, params.swc, params.sor);
  const kro = params.kroEnd * Math.pow(1 - swEff, params.no);
  const krw = params.krwEnd * Math.pow(swEff, params.nw);
  return { swEff, kro, krw };
}

export function coreyRelPermCurve(params: CoreyRelPermParams, steps = 50): CoreyRelPermPoint[] {
  const points: CoreyRelPermPoint[] = [];
  const swStart = params.swc;
  const swEnd = 1 - params.sor;
  if (swEnd <= swStart) {
    return points;
  }
  for (let i = 0; i <= steps; i++) {
    const sw = swStart + ((swEnd - swStart) * i) / steps;
    const { kro, krw } = coreyRelPermAtSw(sw, params);
    points.push({ sw, kro, krw });
  }
  return points;
}
