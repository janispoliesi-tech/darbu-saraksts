'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Section, SectionInvitation, SectionMember } from '@/lib/types';
import { initialsOf, memberLabel, plural } from '@/lib/format';
import Modal from './Modal';
import { errorText } from '@/lib/errors';
import Icon from './Icon';

type Props = {
  section: Section;
  sections: Section[];
  isOwner: boolean;
  userId: string;
  onClose: () => void;
  onChanged: () => void;
};

function quoted(names: string[]): string {
  const q = names.map((n) => `“${n}”`);
  return q.length > 1 ? `${q.slice(0, -1).join(', ')} un ${q[q.length - 1]}` : q[0] ?? '';
}

export default function ShareDialog({ section, sections, isOwner, userId, onClose, onChanged }: Props) {
  const supabase = getSupabase();
  const [members, setMembers] = useState<SectionMember[]>([]);
  const [invites, setInvites] = useState<SectionInvitation[]>([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [targets, setTargets] = useState<string[]>([section.id]);

  const choices = sections.some((s) => s.id === section.id) ? sections : [section, ...sections];
  const allOn = choices.every((s) => targets.includes(s.id));

  function toggleTarget(id: string) {
    setTargets((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  const load = useCallback(async () => {
    const [{ data: m }, { data: i }] = await Promise.all([
      supabase.from('section_members').select('*').eq('section_id', section.id).order('created_at'),
      supabase.from('section_invitations').select('*').eq('section_id', section.id).order('created_at'),
    ]);
    setMembers((m ?? []) as SectionMember[]);
    setInvites((i ?? []) as SectionInvitation[]);
  }, [supabase, section.id]);

  useEffect(() => { load(); }, [load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    const picked = choices.filter((s) => targets.includes(s.id));
    if (!v || picked.length === 0) return;
    setBusy(true);
    setError(null);
    setOk(null);

    const results = await Promise.all(
      picked.map(async (s) => {
        const { data, error } = await supabase.rpc('invite_to_section', { p_section: s.id, p_email: v });
        return { s, data: data as string | null, error };
      })
    );
    setBusy(false);

    const failed = results.filter((r) => r.error);
    const added = results.filter((r) => !r.error && r.data === 'added').map((r) => r.s.name);
    const invited = results.filter((r) => !r.error && r.data === 'invited').map((r) => r.s.name);
    const self = results.some((r) => !r.error && r.data === 'self');

    if (failed.length === results.length) {
      setError(errorText(failed[0].error));
      return;
    }

    setEmail('');
    await load();
    onChanged();

    const parts: string[] = [];
    if (self) parts.push(`Tev jau ir pieeja ${picked.length === 1 ? 'šai sadaļai' : 'šīm sadaļām'}.`);
    if (added.length) {
      parts.push(`${v} pievienots ${added.length === 1 ? 'sadaļai' : 'sadaļām'} ${quoted(added)}.`);
    }
    if (invited.length) {
      parts.push(
        `Uzaicinājums saglabāts (${quoted(invited)}). ${v} redzēs ` +
          `${invited.length === 1 ? 'šo sadaļu' : 'šīs sadaļas'}, tiklīdz reģistrēsies ar šo e-pastu.`
      );
    }
    setOk(parts.join(' '));
    if (failed.length) {
      const where = `${failed.length === 1 ? 'sadaļu' : 'sadaļām'} ${quoted(failed.map((r) => r.s.name))}`;
      setError(`Neizdevās uzaicināt uz ${where}: ${errorText(failed[0].error)}`);
    }
  }

  async function removeMember(m: SectionMember) {
    const self = m.user_id === userId;
    const q = self
      ? `Pamest sadaļu “${section.name}”?`
      : `Izņemt ${memberLabel(m)} no sadaļas “${section.name}”?`;
    if (!confirm(q)) return;
    const { error } = await supabase
      .from('section_members')
      .delete()
      .eq('section_id', section.id)
      .eq('user_id', m.user_id);
    if (error) { setError(errorText(error)); return; }
    await load();
    onChanged();
    if (self) onClose();
  }

  async function cancelInvite(inv: SectionInvitation) {
    const { error } = await supabase.from('section_invitations').delete().eq('id', inv.id);
    if (error) { setError(errorText(error)); return; }
    await load();
  }

  const nobody = members.length === 0 && invites.length === 0;

  return (
    <Modal
      title={`Sadaļa “${section.name}”`}
      icon={section.icon}
      color={section.color}
      dirty={email.trim().length > 0}
      onClose={onClose}
      footer={<button className="btn btn-primary" onClick={onClose}>Aizvērt</button>}
    >
      {error ? <div className="alert alert-error">{error}</div> : null}
      {ok ? <div className="alert alert-ok">{ok}</div> : null}

      {nobody ? (
        <div className="privacy-note">
          <Icon name="lock" />
          <div>
            <b>Šī sadaļa ir privāta</b>
            <p>To redzi tikai tu. Uzaicini kādu, ja gribi to kopīgot.</p>
          </div>
        </div>
      ) : null}

      {members.length > 0 ? (
        <div>
          <div className="picker-label">Kam ir pieeja ({members.length})</div>
          {members.map((m) => (
            <div className="member" key={m.user_id}>
              <span className="avatar">{initialsOf(memberLabel(m))}</span>
              <div className="member-main">
                <div className="member-email">
                  {memberLabel(m)}
                  {m.user_id === userId ? ' (tu)' : ''}
                </div>
                <div className="member-role">{m.email ?? ''}</div>
              </div>
              {isOwner || m.user_id === userId ? (
                <button
                  className="icon-btn danger"
                  onClick={() => removeMember(m)}
                  title={m.user_id === userId ? 'Pamest sadaļu' : 'Izņemt no sadaļas'}
                  aria-label="Izņemt"
                >
                  <Icon name="trash" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {invites.length > 0 ? (
        <div>
          <div className="picker-label">Gaida reģistrēšanos ({invites.length})</div>
          {invites.map((inv) => (
            <div className="member" key={inv.id}>
              <span className="avatar pending">{initialsOf(inv.email)}</span>
              <div className="member-main">
                <div className="member-email">{inv.email}</div>
                <div className="member-role">Uzaicināts — vēl nav reģistrējies</div>
              </div>
              {isOwner ? (
                <button className="icon-btn danger" onClick={() => cancelInvite(inv)} title="Atsaukt uzaicinājumu">
                  <Icon name="close" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {isOwner ? (
        <form className="field invite-form" onSubmit={invite}>
          <label className="label" htmlFor="sh-email">Uzaicināt</label>
          <input
            id="sh-email"
            className="input"
            type="email"
            inputMode="email"
            placeholder="draugs@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {choices.length > 1 ? (
            <div className="field">
              <div className="label-row">
                <span className="label">
                  Uz kurām sadaļām · {targets.length} no {choices.length}
                </span>
                <button
                  type="button"
                  className="linkish"
                  onClick={() => setTargets(allOn ? [section.id] : choices.map((s) => s.id))}
                >
                  {allOn ? 'Tikai šo' : 'Atzīmēt visas'}
                </button>
              </div>
              <div className="sec-picks" role="group" aria-label="Sadaļas, uz kurām uzaicināt">
                {choices.map((s) => {
                  const on = targets.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`sec-pick${on ? ' on' : ''}`}
                      data-color={s.color}
                      onClick={() => toggleTarget(s.id)}
                      aria-pressed={on}
                    >
                      <span className="sec-check"><Icon name="tick" strokeWidth={3} /></span>
                      <Icon name={s.icon} />
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={busy || !email.trim() || targets.length === 0}
          >
            <Icon name="plus" />
            {busy
              ? 'Uzaicina…'
              : targets.length > 1
              ? `Uzaicināt uz ${plural(targets.length, 'sadaļu', 'sadaļām')}`
              : 'Uzaicināt'}
          </button>
          <p className="hint">
            Uzaicinātais redzēs <b>tikai atzīmētās sadaļas</b>, nevis visu sarakstu. Viņam
            jāreģistrējas aplikācijā ar tieši šo e-pasta adresi.
          </p>
        </form>
      ) : (
        <p className="hint">Uzaicināt citus var tikai saraksta īpašnieks.</p>
      )}
    </Modal>
  );
}
