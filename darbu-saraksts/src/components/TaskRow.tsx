'use client';

import type { Task } from '@/lib/types';
import type { Settings } from '@/lib/settings';
import { dueState, formatDue } from '@/lib/format';
import Icon from './Icon';

type Props = {
  task: Task;
  settings: Settings;
  onToggle: (t: Task) => void;
  onDelete: (t: Task) => void;
  onOpen: (t: Task) => void;
};

export default function TaskRow({ task, settings, onToggle, onDelete, onOpen }: Props) {
  const ds = dueState(task.due_date);
  const showDue =
    !!task.due_date &&
    !task.is_done &&
    (settings.showDue === 'always' ||
      (settings.showDue === 'overdue' && (ds === 'overdue' || ds === 'today')));

  const hasNote = !!task.note?.trim();

  return (
    <li className={`task prio-${task.priority}${task.is_done ? ' is-done' : ''}`}>
      <button
        className={`tickbox${task.is_done ? ' on' : ''}`}
        onClick={() => onToggle(task)}
        aria-pressed={task.is_done}
        aria-label={task.is_done ? 'Atzīmēt kā neizpildītu' : 'Atzīmēt kā izpildītu'}
      >
        <Icon name="check" strokeWidth={3} />
      </button>

      <button className="task-main" onClick={() => onOpen(task)} title="Atvērt un rediģēt">
        <span className="task-text">
          <span className="task-title">{task.title}</span>
          {settings.showNotes && hasNote ? <span className="task-note">{task.note}</span> : null}
        </span>

        <span className="task-badges">
          {showDue ? (
            <span className={`mini${ds === 'overdue' ? ' overdue' : ds === 'today' ? ' today' : ''}`}>
              <Icon name="calendar" />
              {formatDue(task.due_date as string)}
            </span>
          ) : null}
          {!settings.showNotes && hasNote ? <Icon name="note" className="note-dot" /> : null}
        </span>
      </button>

      <button
        className="icon-btn tiny"
        onClick={() => onOpen(task)}
        aria-label="Rediģēt darbu"
        title="Rediģēt"
      >
        <Icon name="pencil" />
      </button>

      <button
        className="icon-btn tiny danger"
        onClick={() => onDelete(task)}
        aria-label="Dzēst darbu"
        title="Dzēst"
      >
        <Icon name="trash" />
      </button>
    </li>
  );
}
