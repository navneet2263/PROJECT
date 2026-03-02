/** Conversion factors: value_in_unit * factor = value_SI (base unit) */
const TO_SI: Record<QuantityType, Record<string, number>> = {
  pressure: {
    psi: 6894.76,
    bar: 100000,
    MPa: 1e6,
    kPa: 1000,
    atm: 101325,
    Pa: 1,
  },
  length: {
    ft: 0.3048,
    m: 1,
    in: 0.0254,
  },
  area: {
    acre: 4046.86,
    "ft²": 0.092903,
    "m²": 1,
  },
  volume: {
    bbl: 0.158987,
    stb: 0.158987,
    "m³": 1,
    "ft³": 0.0283168,
  },
  temperature: {
    K: 1,
    "°C": 1, // special: offset
    "°F": 1, // special: offset
    "°R": 5 / 9, // Rankine to K
  },
  density: {
    ppg: 119.826,
    "kg/m³": 1,
    "lb/ft³": 16.0185,
    "g/cc": 1000,
  },
  viscosity: {
    cP: 0.001,
    "Pa·s": 1,
  },
  flowrate: {
    "stb/d": 0.158987 / 86400,
    "bbl/d": 0.158987 / 86400,
    "m³/d": 1 / 86400,
    "m³/s": 1,
    "MSCF/d": (1000 * 0.0283168) / 86400,
    "MMSCF/d": (1e6 * 0.0283168) / 86400,
  },
  permeability: {
    mD: 9.86923e-16,
    D: 9.86923e-13,
    "m²": 1,
  },
  dimensionless: { "—": 1 },
  time: { s: 1, min: 60, h: 3600, d: 86400 },
  pressure_per_length: { "psi/ft": 6894.76 / 0.3048, "Pa/m": 1 },
  velocity: { "m/s": 1, "ft/s": 0.3048 },
};

const OILFIELD_DEFAULT: Record<QuantityType, string> = {
  pressure: "psi",
  length: "ft",
  area: "acre",
  volume: "stb",
  temperature: "°F",
  density: "ppg",
  viscosity: "cP",
  flowrate: "stb/d",
  permeability: "mD",
  dimensionless: "—",
  time: "min",
  pressure_per_length: "psi/ft",
  velocity: "ft/s",
};

export type QuantityType =
  | "pressure"
  | "length"
  | "area"
  | "volume"
  | "temperature"
  | "density"
  | "viscosity"
  | "flowrate"
  | "permeability"
  | "dimensionless"
  | "time"
  | "pressure_per_length"
  | "velocity";

export const QUANTITY_TYPES: QuantityType[] = [
  "pressure",
  "length",
  "area",
  "volume",
  "temperature",
  "density",
  "viscosity",
  "flowrate",
  "permeability",
  "dimensionless",
  "time",
  "pressure_per_length",
  "velocity",
];

export function getUnitsForQuantity(quantity: QuantityType): string[] {
  return Object.keys(TO_SI[quantity]);
}

export function convertToSI(value: number, unit: string, quantity: QuantityType): number {
  const map = TO_SI[quantity];
  const factor = map[unit];
  if (factor === undefined) return NaN;
  if (quantity === "temperature") {
    if (unit === "K") return value;
    if (unit === "°C") return value + 273.15;
    if (unit === "°F") return (value - 32) * (5 / 9) + 273.15;
    if (unit === "°R") return value * (5 / 9);
    return NaN;
  }
  return value * factor;
}

export function convertFromSI(valueSI: number, unit: string, quantity: QuantityType): number {
  const map = TO_SI[quantity];
  const factor = map[unit];
  if (factor === undefined) return NaN;
  if (quantity === "temperature") {
    if (unit === "K") return valueSI;
    if (unit === "°C") return valueSI - 273.15;
    if (unit === "°F") return (valueSI - 273.15) * (9 / 5) + 32;
    if (unit === "°R") return valueSI * (9 / 5);
    return NaN;
  }
  return valueSI / factor;
}

export function formatOilfield(valueSI: number, quantity: QuantityType): string {
  const unit = OILFIELD_DEFAULT[quantity];
  const value = convertFromSI(valueSI, unit, quantity);
  if (Number.isNaN(value) || !Number.isFinite(value)) return "—";
  const decimals = value < 0.01 || value > 1e6 ? 4 : 2;
  const formatted = value.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
  return `${formatted} ${unit}`;
}

export function getOilfieldDefaultUnit(quantity: QuantityType): string {
  return OILFIELD_DEFAULT[quantity];
}

export function valueToOilfield(valueSI: number, quantity: QuantityType): { value: number; unit: string } {
  const unit = OILFIELD_DEFAULT[quantity];
  return { value: convertFromSI(valueSI, unit, quantity), unit };
}
