'use client';

import { useEffect, useRef } from 'react';
import type { Section } from '@/lib/types';
import Icon from './Icon';

type Props = {
  sections: Section[];
  activeId: string | null;
  counts: Record<string, number>;
  shared?: Record<string, number>;
  onSelect: (id: string) => void;
  onAdd?: () => void;
};

export default function SectionTabs({ sections, activeId, counts, shared, onSelect, onAdd }: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scroller.current?.querySelector<HTMLElement>('.tab.is-active');
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeId, sections.length]);

  return (
    <nav className="tabs-outer" aria-label="Sadaļas">
      <div className="tabs-scroller" ref={scroller}>
        {sections.map((s) => {
          const n = counts[s.id] ?? 0;
          const sh = shared?.[s.id] ?? 0;
          return (
            <button
              key={s.id}
              className={`tab${s.id === activeId ? ' is-active' : ''}`}
              data-color={s.color}
              onClick={() => onSelect(s.id)}
              aria-current={s.id === activeId ? 'page' : undefined}
            >
              <Icon name={s.icon} className="tab-icon" />
              {s.name}
              {sh > 0 ? <Icon name="users" className="tab-shared" /> : null}
              {n > 0 ? <span className="tab-count">{n}</span> : null}
            </button>
          );
        })}

        {onAdd ? (
          <button className="tab-add" onClick={onAdd} title="Pievienot jaunu sadaļu">
            <Icon name="plus" />
            Sadaļa
          </button>
        ) : null}
      </div>
    </nav>
  );
}
