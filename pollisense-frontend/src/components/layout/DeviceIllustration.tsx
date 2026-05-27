export function DeviceIllustration() {
  return (
    <div className="mx-auto grid h-28 w-32 place-items-center">
      <div className="relative h-24 w-24">
        <div className="absolute left-7 top-0 h-9 w-12 -rotate-12 rounded-sm border border-sky-200 bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg">
          <div className="grid h-full grid-cols-3 gap-px p-1">
            {Array.from({ length: 9 }).map((_, index) => (
              <span key={index} className="rounded-[1px] bg-sky-300/40" />
            ))}
          </div>
        </div>
        <div className="absolute left-11 top-8 h-8 w-1 rounded bg-slate-400" />
        <div className="absolute bottom-0 left-4 h-16 w-16 rounded-md border border-slate-500 bg-gradient-to-br from-slate-300 to-slate-600 shadow-xl">
          <div className="absolute left-5 top-5 h-6 w-6 rounded-full border-4 border-slate-700 bg-slate-950 shadow-inner" />
          <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <div className="absolute bottom-5 right-2 h-10 w-6 rounded border border-slate-400 bg-slate-700" />
      </div>
    </div>
  );
}
