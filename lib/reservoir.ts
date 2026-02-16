/** STOIIP: all inputs in SI. Area m², thickness m, porosity/sw/Bo/NTG dimensionless. Returns stock-tank volume in m³. */
export interface STOIIPInputSI {
  areaM2: number;
  thicknessM: number;
  porosity: number;
  sw: number;
  bo: number;
  ntg?: number;
}

export function stoiipSI(input: STOIIPInputSI): number {
  const { areaM2, thicknessM, porosity, sw, bo, ntg = 1 } = input;
  const reservoirVolumeM3 = areaM2 * thicknessM * porosity * (1 - sw) * ntg;
  return reservoirVolumeM3 / bo;
}

export interface BoInput {
  rs: number;
  oilApi: number;
  gasSG: number;
  tF: number;
  pPsi: number;
}

export function formationVolumeFactorBo(input: BoInput): number {
  const { rs, oilApi, gasSG, tF, pPsi } = input;
  const F = rs * Math.pow(gasSG / Math.pow(oilApi / 131.5 + 0.0125 * (tF - 60), 0.5), 0.5) + 1.25 * (tF - 60);
  const Bo = 0.9759 + 0.00012 * F;
  return Math.max(1, Bo);
}

/** Temperature K, pressure Pa. Converts to field units for correlation; returns Bo dimensionless. */
export interface BoInputSI {
  rs: number;
  oilApi: number;
  gasSG: number;
  tK: number;
  pPa: number;
}

export function formationVolumeFactorBoSI(input: BoInputSI): number {
  const tF = (input.tK - 273.15) * (9 / 5) + 32;
  const pPsi = input.pPa / 6894.76;
  return formationVolumeFactorBo({ ...input, tF, pPsi });
}

export interface MaterialBalanceInput {
  n: number;
  bo: number;
  bp: number;
  boi: number;
  bpi: number;
  cf: number;
  cw: number;
  swi: number;
  we: number;
  wp: number;
  np: number;
  gp: number;
  rs: number;
  rsi: number;
  bg: number;
  bgi: number;
}

export function materialBalanceBasic(input: MaterialBalanceInput): { f: number; eo: number; eg: number } {
  const { n, bo, bp, boi, bpi, cf, cw, swi, we, wp, np, gp, rs, rsi, bg, bgi } = input;
  const eo = bo - boi + (rsi - rs) * bg;
  const eg = boi * (bg / bgi - 1);
  const f = np * (bo + (rsi - rs) * bg) + gp * bg - we + wp * bp;
  return { f, eo, eg };
}

/** Volumes in m³. Returns f in m³, eo and eg dimensionless. */
export interface MaterialBalanceInputSI {
  n: number;
  bo: number;
  bp: number;
  boi: number;
  bpi: number;
  cf: number;
  cw: number;
  swi: number;
  we: number;
  wp: number;
  np: number;
  gp: number;
  rs: number;
  rsi: number;
  bg: number;
  bgi: number;
}

export function materialBalanceBasicSI(input: MaterialBalanceInputSI): { fM3: number; eo: number; eg: number } {
  const { bo, boi, bp, we, wp, np, gp, rs, rsi, bg, bgi } = input;
  const eo = bo - boi + (rsi - rs) * bg;
  const eg = boi * (bg / bgi - 1);
  const fM3 = np * (bo + (rsi - rs) * bg) + gp * bg - we + wp * bp;
  return { fM3, eo, eg };
}
