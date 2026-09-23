'use client';

import { useEffect, useState } from 'react';
import type { Task } from '@/lib/types';
import type { Settings } from '@/lib/settings';
import { plural } from '@/lib/format';
import Icon from './Icon';
import TaskRow from './TaskRow';

type Props = {
  tasks: Task[];
  settings: Settings;
  onToggle: (t: Task) => void;
  onDelete: (t: Task) => void;
  onOpen: (t: Task) => void;
  onClearDone: () => void;
};

export default function TaskList({ tasks, settings, onToggle, onDelete, onOpen, onClearDone }: Props) {
  const [collapsed, setCollapsed] = useState(settings.doneCollapsed);
  useEffect(() => setCollapsed(settings.doneCollapsed), [settings.doneCollapsed]);
  const open = tasks.filter((t) => !t.is_done);
  const done = tasks.filter((t) => t.is_done);

  const rowProps = { settings, onToggle, onDelete, onOpen };

  return (
    <>
      {open.length === 0 && done.length === 0 ? (
        <div className="empty">
          <Icon name="check" />
          <b>Šeit vēl nav darbu</b>
          <p>Ieraksti pirmo darbu laukā ekrāna apakšā.</p>
        </div>
      ) : null}

      {open.length > 0 ? (
        <ul className="list">
          {open.map((t) => (
            <TaskRow key={t.id} task={t} {...rowProps} />
          ))}
        </ul>
      ) : null}

      {open.length === 0 && done.length > 0 ? (
        <div className="empty">
          <Icon name="check" />
          <b>Viss izdarīts!</b>
          <p>Visi šīs sadaļas darbi ir pabeigti.</p>
        </div>
      ) : null}

      {done.length > 0 && settings.showDone ? (
        <>
          <div className="done-head">
            <button className="linkbtn" onClick={() => setCollapsed((v) => !v)}>
              {collapsed ? '▸' : '▾'} Izpildīts · {plural(done.length, 'darbs', 'darbi', 'darbu')}
            </button>
            <span className="grow" />
            <button className="linkbtn" onClick={onClearDone}>
              Notīrīt
            </button>
          </div>
          {!collapsed ? (
            <ul className="list">
              {done.map((t) => (
                <TaskRow key={t.id} task={t} {...rowProps} />
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </>
  );
}
