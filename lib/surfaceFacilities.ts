/** All inputs SI: flowrate m³/s, time s, pressure Pa, T K. Returns diameter m, length m, volume m³. */
export interface SeparatorSizingInputSI {
  qOilM3S: number;
  retentionTimeS: number;
  operatingPa: number;
  z: number;
  tK: number;
}

export function separatorSizingSI(input: SeparatorSizingInputSI): { diameterM: number; lengthM: number; volumeM3: number } {
  const { qOilM3S, retentionTimeS } = input;
  const volM3 = qOilM3S * retentionTimeS * 1.5;
  const diameterM = Math.sqrt(volM3 / (Math.PI * 5));
  const lengthM = 5 * diameterM;
  return {
    diameterM: Math.round(diameterM * 1000) / 1000,
    lengthM: Math.round(lengthM * 1000) / 1000,
    volumeM3: Math.round(volM3 * 100) / 100,
  };
}
