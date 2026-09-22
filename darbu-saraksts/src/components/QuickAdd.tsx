'use client';

import { useState } from 'react';
import Icon from './Icon';

type Props = {
  /** Ātrā pievienošana: tikai nosaukums */
  onAdd: (title: string) => void;
  /** Atver logu ar piezīmi, termiņu un prioritāti */
  onOpenFull: (title: string) => void;
  disabled?: boolean;
};

/** Šaura josla ekrāna apakšā jauna darba pievienošanai. */
export default function QuickAdd({ onAdd, onOpenFull, disabled }: Props) {
  const [title, setTitle] = useState('');
  const ready = title.trim().length > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    onAdd(title.trim());
    setTitle('');
  }

  return (
    <div className="quickadd">
      <form className="quickadd-inner" onSubmit={submit}>
        <input
          className="qa-input"
          placeholder="Jauns darbs…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          enterKeyHint="done"
          disabled={disabled}
          aria-label="Jauna darba nosaukums"
        />
        <button
          type="button"
          className="qa-btn"
          onClick={() => {
            onOpenFull(title.trim());
            setTitle('');
          }}
          disabled={disabled}
          title="Pievienot ar piezīmi, termiņu un prioritāti"
          aria-label="Papildu lauki"
        >
          <Icon name="dots" />
        </button>
        <button className="qa-btn qa-send" type="submit" disabled={!ready} aria-label="Pievienot">
          <Icon name="plus" strokeWidth={2.4} />
        </button>
      </form>
    </div>
  );
}
