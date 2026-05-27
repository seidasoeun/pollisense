export function Meter({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-950">{value}{suffix}</span>
      </div>
      <div className="mt-2 h-2 rounded bg-slate-200">
        <div className={`h-2 rounded ${value < 25 ? 'bg-rose-500' : value < 55 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
