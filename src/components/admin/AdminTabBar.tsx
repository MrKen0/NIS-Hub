"use client";

export type AdminTab = 'services' | 'products' | 'events' | 'notices' | 'requests' | 'members';

interface TabDef {
  id: AdminTab;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'services', label: 'Services' },
  { id: 'products', label: 'Products' },
  { id: 'events', label: 'Events' },
  { id: 'notices', label: 'Notices' },
  { id: 'requests', label: 'Requests' },
  { id: 'members', label: 'Members' },
];

interface Props {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingCounts: Record<AdminTab, number>;
}

export default function AdminTabBar({ activeTab, onTabChange, pendingCounts }: Props) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-2 min-w-max pb-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = pendingCounts[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={`relative flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition min-h-[44px] ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-xs font-bold ${
                    isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
