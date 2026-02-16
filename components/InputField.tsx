"use client";

interface InputFieldProps {
  label: string;
  name: string;
  type?: "number" | "text";
  value: string | number;
  onChange: (value: string) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: string;
  placeholder?: string;
}

export default function InputField({
  label,
  name,
  type = "number",
  value,
  onChange,
  unit,
  min,
  max,
  step = "any",
  placeholder,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="flex rounded-lg border border-border bg-surface focus-within:ring-2 focus-within:ring-accent/30">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className="flex-1 rounded-l-lg border-0 bg-transparent px-3 py-2 text-slate-900 placeholder:text-muted focus:outline-none dark:text-slate-100"
        />
        {unit && (
          <span className="flex items-center border-l border-border px-3 py-2 text-sm text-muted">{unit}</span>
        )}
      </div>
    </div>
  );
}
