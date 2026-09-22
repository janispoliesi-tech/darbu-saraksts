'use client';

import { useState } from 'react';
import type { Section } from '@/lib/types';
import Modal from './Modal';
import Icon from './Icon';
import IconPicker from './IconPicker';

type Props = {
  section: Section | null;
  onClose: () => void;
  onSave: (v: { name: string; icon: string; color: string }) => void;
  onDelete?: () => void;
};

export default function SectionDialog({ section, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(section?.name ?? '');
  const [icon, setIcon] = useState(section?.icon ?? 'list');
  const [color, setColor] = useState(section?.color ?? 'teal');

  const valid = name.trim().length > 0;

  return (
    <Modal
      title={section ? 'Rediģēt sadaļu' : 'Jauna sadaļa'}
      icon={icon}
      color={color}
      onClose={onClose}
      footer={
        <>
          {onDelete ? (
            <button className="btn btn-danger btn-icon-only" onClick={onDelete} title="Dzēst sadaļu">
              <Icon name="trash" />
            </button>
          ) : null}
          <button className="btn" onClick={onClose}>
            Atcelt
          </button>
          <button
            className="btn btn-primary"
            disabled={!valid}
            onClick={() => onSave({ name: name.trim(), icon, color })}
          >
            Saglabāt
          </button>
        </>
      }
    >
      <div className="field">
        <label className="label" htmlFor="sec-name">
          Sadaļas nosaukums
        </label>
        <input
          id="sec-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Piem., Būvniecība"
          autoFocus
          maxLength={40}
        />
      </div>

      <IconPicker icon={icon} color={color} onIcon={setIcon} onColor={setColor} />

      {section ? (
        <p className="hint">
          Dzēšot sadaļu, tiks dzēsti arī visi tajā esošie darbi.
        </p>
      ) : null}
    </Modal>
  );
}
