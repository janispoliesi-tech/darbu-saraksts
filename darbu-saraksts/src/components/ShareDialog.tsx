'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Section, SectionInvitation, SectionMember } from '@/lib/types';
import { initialsOf, memberLabel } from '@/lib/format';
import Modal from './Modal';
import Icon from './Icon';

type Props = {
  section: Section;
  isOwner: boolean;
  userId: string;
  onClose: () => void;
  onChanged: () => void;
};

/** Kas drīkst redzēt un lietot VIENU sadaļu. */
export default function ShareDialog({ section, isOwner, userId, onClose, onChanged }: Props) {
  const supabase = getSupabase();
  const [members, setMembers] = useState<SectionMember[]>([]);
  const [invites, setInvites] = useState<SectionInvitation[]>([]);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

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
    if (!v) return;
    setBusy(true);
    setError(null);
    setOk(null);
    const { data, error } = await supabase.rpc('invite_to_section', { p_section: section.id, p_email: v });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setEmail('');
    await load();
    onChanged();
    setOk(
      data === 'added'
        ? `${v} pievienots sadaļai “${section.name}”.`
        : data === 'self'
        ? 'Tev jau ir pieeja šai sadaļai.'
        : `Uzaicinājums saglabāts. ${v} redzēs šo sadaļu, tiklīdz reģistrēsies ar šo e-pastu.`
    );
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
    if (error) { setError(error.message); return; }
    await load();
    onChanged();
    if (self) onClose();
  }

  async function cancelInvite(inv: SectionInvitation) {
    const { error } = await supabase.from('section_invitations').delete().eq('id', inv.id);
    if (error) { setError(error.message); return; }
    await load();
  }

  const nobody = members.length === 0 && invites.length === 0;

  return (
    <Modal
      title={`Sadaļa “${section.name}”`}
      icon={section.icon}
      color={section.color}
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
        <form className="field" onSubmit={invite}>
          <label className="label" htmlFor="sh-email">Uzaicināt uz šo sadaļu</label>
          <div className="inline-form">
            <input
              id="sh-email"
              className="input"
              type="email"
              inputMode="email"
              placeholder="draugs@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={busy || !email.trim()}>
              <Icon name="plus" />
              Uzaicināt
            </button>
          </div>
          <p className="hint">
            Uzaicinātais redzēs <b>tikai šo sadaļu</b>, nevis visu sarakstu. Viņam jāreģistrējas
            aplikācijā ar tieši šo e-pasta adresi.
          </p>
        </form>
      ) : (
        <p className="hint">Uzaicināt citus var tikai saraksta īpašnieks.</p>
      )}
    </Modal>
  );
}
