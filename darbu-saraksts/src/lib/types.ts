export type Priority = 1 | 2 | 3;

export type Board = {
  id: string;
  name: string;
  owner_id: string;
  owner_name: string | null;
  created_at: string;
};

/** Cilvēks, kam ir pieeja konkrētai sadaļai */
export type SectionMember = {
  section_id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  created_at: string;
};

/** Uzaicinājums uz sadaļu, kas gaida reģistrēšanos */
export type SectionInvitation = {
  id: string;
  section_id: string;
  email: string;
  created_at: string;
};

export type Section = {
  id: string;
  board_id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
  created_at: string;
};

export type Task = {
  id: string;
  board_id: string;
  section_id: string;
  title: string;
  note: string | null;
  due_date: string | null;
  priority: Priority;
  is_done: boolean;
  done_at: string | null;
  position: number;
  created_by: string | null;
  created_at: string;
};

export type SortMode = 'priority' | 'due' | 'added';
