"use client";

interface Tab {
  key: string;
  label: string;
  /** Optional badge count — renders a small dot/number next to the label
   *  when > 0. Used for unread/unactioned signals (e.g. History tab on
   *  /schedule with pending review items). */
  badge?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Extra class on the container — e.g. `sys-tab-fill` to stretch the bar. */
  className?: string;
}

export function TabBar({ tabs, activeKey, onChange, className }: TabBarProps) {
  return (
    <div className={`tab-bar-container${className ? ` ${className}` : ""}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        const showBadge = tab.badge !== undefined && tab.badge > 0;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="tab-main"
            data-active={isActive || undefined}
          >
            {tab.label}
            {showBadge && (
              <span className="tab-badge" aria-label={`${tab.badge} pending`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
