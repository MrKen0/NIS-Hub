"use client";

export type AdminTab = 'services' | 'products' | 'events' | 'notices' | 'requests' | 'members' | 'history';

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
  { id: 'history', label: 'History' },
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
                isActive ? 'shadow-sm' : 'bg-white hover:opacity-90'
              }`}
              style={
                isActive
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { border: '1px solid var(--color-border)', color: 'var(--color-muted)' }
              }
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-xs font-bold"
                  style={
                    isActive
                      ? { background: '#fff', color: 'var(--color-primary)' }
                      : { background: '#EF4444', color: '#fff' }
                  }
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
