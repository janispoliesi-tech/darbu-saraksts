'use client';

import { ICON_GROUPS, SECTION_COLORS } from '@/lib/icons';
import Icon from './Icon';

type Props = {
  icon: string;
  color: string;
  onIcon: (key: string) => void;
  onColor: (key: string) => void;
};

export default function IconPicker({ icon, color, onIcon, onColor }: Props) {
  return (
    <>
      <div className="field">
        <label className="label">Krāsa</label>
        <div className="color-row">
          {SECTION_COLORS.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`color-dot${c.key === color ? ' on' : ''}`}
              data-color={c.key}
              onClick={() => onColor(c.key)}
              title={c.label}
              aria-label={c.label}
              aria-pressed={c.key === color}
            >
              <i />
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="label">Ikona</label>
        <div className="scroll-box" data-color={color}>
          {ICON_GROUPS.map((g) => (
            <div className="picker-group" key={g.label}>
              <div className="picker-label">{g.label}</div>
              <div className="icon-grid">
                {g.keys.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`icon-choice${k === icon ? ' on' : ''}`}
                    onClick={() => onIcon(k)}
                    aria-pressed={k === icon}
                    aria-label={k}
                  >
                    <Icon name={k} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
