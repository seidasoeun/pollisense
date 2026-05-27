export function Threshold({ label, value, onChange, step, max, suffix = '' }: { label: string; value: number; onChange: (value: number) => void; step: number; max: number; suffix?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-2 flex justify-between font-semibold text-slate-700">
        {label}
        <span>{value}{suffix}</span>
      </span>
      <input className="w-full" type="range" min={0} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
