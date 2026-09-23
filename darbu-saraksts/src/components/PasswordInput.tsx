'use client';

import { useState } from 'react';
import Icon from './Icon';

type Props = {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
};

export default function PasswordInput({
  id, value, onChange, placeholder, autoComplete, autoFocus,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="pw-wrap">
      <input
        id={id}
        className="input"
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required
      />
      <button
        type="button"
        className="pw-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Paslēpt paroli' : 'Parādīt paroli'}
        title={visible ? 'Paslēpt paroli' : 'Parādīt paroli'}
      >
        <Icon name={visible ? 'eye-off' : 'eye'} />
      </button>
    </span>
  );
}
