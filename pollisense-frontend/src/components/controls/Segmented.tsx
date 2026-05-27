export function Segmented<T extends string>({ value, onChange, values }: { value: T; onChange: (value: T) => void; values: T[] }) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
      {values.map((item) => (
        <button key={item} className={`rounded px-3 py-1 text-sm capitalize ${value === item ? 'bg-emerald-700 text-white' : 'text-slate-600'}`} type="button" onClick={() => onChange(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}
