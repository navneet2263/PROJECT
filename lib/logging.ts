/** Rt, Rw in Ω·m (SI). Porosity, a, m, n dimensionless. Returns Sw fraction. */
export interface ArchieInputSI {
  rt: number;
  rw: number;
  porosity: number;
  a: number;
  m: number;
  n: number;
}

export function archieWaterSaturationSI(input: ArchieInputSI): number {
  const { rt, rw, porosity, a, m, n } = input;
  const F = a / Math.pow(porosity, m);
  const Sw = Math.pow((F * rw) / rt, 1 / n);
  return Math.min(1, Math.max(0, Sw));
}

/** All densities in kg/m³ (SI). Returns porosity fraction. */
export interface DensityPorosityInputSI {
  rhoBKgM3: number;
  rhoMaKgM3: number;
  rhoFlKgM3: number;
}

export function densityPorositySI(input: DensityPorosityInputSI): number {
  const { rhoBKgM3, rhoMaKgM3, rhoFlKgM3 } = input;
  if (rhoMaKgM3 === rhoFlKgM3) return 0;
  return (rhoMaKgM3 - rhoBKgM3) / (rhoMaKgM3 - rhoFlKgM3);
}
