'use client';

import { useState } from 'react';
import type { Priority, Section } from '@/lib/types';
import Modal from './Modal';
import Icon from './Icon';

export type TaskDraft = {
  title: string;
  note: string;
  due: string;
  priority: Priority;
  sectionId: string;
};

type Props = {
  initial: TaskDraft;
  isNew: boolean;
  sections: Section[];
  onClose: () => void;
  onSave: (v: TaskDraft) => void;
  onDelete?: () => void;
};

export default function TaskDialog({ initial, isNew, sections, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(initial.title);
  const [note, setNote] = useState(initial.note);
  const [due, setDue] = useState(initial.due);
  const [priority, setPriority] = useState<Priority>(initial.priority);
  const [sectionId, setSectionId] = useState(initial.sectionId);

  const valid = title.trim().length > 0;

  // Ja kaut kas ir ierakstīts vai mainīts, nejaušs pieskāriens blakus logam to neaizver
  const dirty =
    (isNew && (title.trim().length > 0 || note.trim().length > 0 || due !== '')) ||
    title !== initial.title ||
    note !== initial.note ||
    due !== initial.due ||
    priority !== initial.priority ||
    sectionId !== initial.sectionId;

  return (
    <Modal
      title={isNew ? 'Jauns darbs' : 'Rediģēt darbu'}
      icon={isNew ? 'plus' : 'pencil'}
      dirty={dirty}
      onClose={onClose}
      footer={
        <>
          {onDelete ? (
            <button className="btn btn-danger btn-icon-only" onClick={onDelete} title="Dzēst darbu">
              <Icon name="trash" />
            </button>
          ) : null}
          <button className="btn" onClick={onClose}>
            Atcelt
          </button>
          <button
            className="btn btn-primary"
            disabled={!valid}
            onClick={() =>
              onSave({ title: title.trim(), note: note.trim(), due, priority, sectionId })
            }
          >
            {isNew ? 'Pievienot' : 'Saglabāt'}
          </button>
        </>
      }
    >
      <div className="field">
        <label className="label" htmlFor="t-title">Nosaukums</label>
        <input
          id="t-title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          placeholder="Ko vajag izdarīt?"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="t-note">Piezīme</label>
        <textarea
          id="t-note"
          className="textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Izmēri, materiāli, kontakti…"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="field">
          <label className="label" htmlFor="t-due">Termiņš</label>
          <input id="t-due" className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div className="field">
          <label className="label" htmlFor="t-prio">Prioritāte</label>
          <select
            id="t-prio"
            className="select"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as Priority)}
          >
            <option value={1}>Augsta</option>
            <option value={2}>Vidēja</option>
            <option value={3}>Zema</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="t-sec">Sadaļa</label>
        <select id="t-sec" className="select" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
}
