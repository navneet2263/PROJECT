"use client";

import { useCallback, useEffect } from "react";
import {
  type QuantityType,
  getUnitsForQuantity,
  convertToSI,
} from "@/lib/units";

export interface UnitInputProps {
  quantity: QuantityType;
  label: string;
  name: string;
  value: string;
  unit: string;
  onValueChange: (value: string) => void;
  onUnitChange: (unit: string) => void;
  onValueSI: (valueSI: number | null) => void;
  min?: number;
  max?: number;
  step?: string;
  placeholder?: string;
}

export default function UnitInput({
  quantity,
  label,
  name,
  value,
  unit,
  onValueChange,
  onUnitChange,
  onValueSI,
  min,
  max,
  step = "any",
  placeholder,
}: UnitInputProps) {
  const units = getUnitsForQuantity(quantity);
  const displayUnit = units.includes(unit) ? unit : units[0];

  const validateAndEmit = useCallback(() => {
    const num = Number(value);
    if (value === "" || Number.isNaN(num) || !Number.isFinite(num)) {
      onValueSI(null);
      return;
    }
    const valueSI = convertToSI(num, displayUnit, quantity);
    if (!Number.isFinite(valueSI)) {
      onValueSI(null);
      return;
    }
    if (min !== undefined && num < min) {
      onValueSI(null);
      return;
    }
    if (max !== undefined && num > max) {
      onValueSI(null);
      return;
    }
    onValueSI(valueSI);
  }, [value, displayUnit, quantity, onValueSI, min, max]);

  useEffect(() => {
    validateAndEmit();
  }, [validateAndEmit]);

  const handleValueChange = (next: string) => {
    onValueChange(next);
  };

  const handleUnitChange = (nextUnit: string) => {
    onUnitChange(nextUnit);
  };

  const numValue = Number(value);
  const isValid = value !== "" && !Number.isNaN(numValue) && Number.isFinite(numValue);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="flex rounded-lg border border-border bg-surface focus-within:ring-2 focus-within:ring-accent/30">
        <input
          id={name}
          name={name}
          type="number"
          value={value}
          onChange={(e) => handleValueChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className="flex-1 rounded-l-lg border-0 bg-transparent px-3 py-2 text-slate-900 placeholder:text-muted focus:outline-none dark:text-slate-100"
          aria-invalid={!isValid}
        />
        <select
          value={displayUnit}
          onChange={(e) => handleUnitChange(e.target.value)}
          className="flex items-center border-l border-border bg-transparent px-3 py-2 text-sm text-muted focus:outline-none dark:bg-surface-elevated"
          aria-label={`${label} unit`}
        >
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
