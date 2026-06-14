'use client';

import { cn, CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/utils';

const CATEGORIES = ['all', 'scooter', 'ac', 'washing_machine', 'electronics', 'appliance', 'other'];

interface CategoryFilterProps {
  selected: string;
  onChange: (category: string) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const isAll = cat === 'all';
        const label = isAll ? 'All' : CATEGORY_LABELS[cat] || cat;
        const icon = isAll ? '✨' : CATEGORY_ICONS[cat] || '📦';
        const isSelected = selected === cat || (cat === 'all' && !selected);

        return (
          <button
            key={cat}
            onClick={() => onChange(cat === 'all' ? '' : cat)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 border',
              isSelected
                ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                : 'bg-bg-secondary text-text-secondary border-border-subtle hover:border-border-default hover:text-text-primary'
            )}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
