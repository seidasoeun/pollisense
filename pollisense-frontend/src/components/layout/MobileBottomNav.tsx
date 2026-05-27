import type { PageId } from '../../config/navigation';
import { mobilePageLabels, mobilePrimaryPages } from '../../config/navigation';

export function MobileBottomNav({
  activePage,
  setActivePage,
}: {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobilePrimaryPages.map((page) => {
          const Icon = page.icon;
          const active = activePage === page.id;
          return (
            <button
              key={page.id}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold leading-none ${
                active ? 'bg-emerald-700 text-white' : 'text-slate-600'
              }`}
              type="button"
              onClick={() => setActivePage(page.id)}
            >
              <Icon size={18} />
              {mobilePageLabels[page.id]}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

