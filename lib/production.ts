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

/** Pressures in Pa, flowrate in m³/s. Returns rate in m³/s. */
export function vogelIPRSI(prPa: number, pwfPa: number, qMaxM3S: number): number {
  if (pwfPa >= prPa) return 0;
  const qRel = 1 - 0.2 * (pwfPa / prPa) - 0.8 * Math.pow(pwfPa / prPa, 2);
  return qMaxM3S * qRel;
}

export interface VogelIPRCurveInputSI {
  prPa: number;
  qMaxM3S: number;
}

export function vogelIPRCurveSI(input: VogelIPRCurveInputSI, steps = 20): { pwfPa: number; qM3S: number }[] {
  const { prPa, qMaxM3S } = input;
  const curve: { pwfPa: number; qM3S: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const pwfPa = (prPa * (steps - i)) / steps;
    curve.push({ pwfPa, qM3S: vogelIPRSI(prPa, pwfPa, qMaxM3S) });
  }
  return curve;
}
