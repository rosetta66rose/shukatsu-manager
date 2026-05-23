export type CompanyType = 'インターン' | '本選考';

export type Status =
  | '未応募'
  | '応募済み'
  | 'ES通過'
  | '一次面接'
  | '二次面接'
  | '最終面接'
  | '選考中'
  | '参加確定'
  | '内定'
  | '辞退'
  | '不合格';

export const INTERN_STATUSES: Status[] = [
  '未応募', '応募済み', '選考中', 'ES通過', '参加確定', '辞退', '不合格',
];

export const HONSEN_STATUSES: Status[] = [
  '未応募', '応募済み', 'ES通過', '一次面接', '二次面接', '最終面接', '内定', '辞退', '不合格',
];

export interface Company {
  id: string;
  type: CompanyType;
  name: string;
  deadline: string | null;
  selectionProcess: string;
  eventDates: string;   // 参加日（インターン）or 面接日（本選考）
  location: string;
  notes: string;
  status: Status;
  memo: string;
  gcalDeadlineId?: string;   // Google Calendar event ID for deadline
  gcalEventIds?: string[];   // Google Calendar event IDs for event dates
}
