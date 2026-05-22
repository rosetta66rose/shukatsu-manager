export type Status =
  | '未応募'
  | '応募済み'
  | '選考中'
  | '参加確定'
  | '辞退'
  | '不合格';

export interface Company {
  id: string;
  name: string;
  deadline: string | null;     // ISO date string or null
  selectionProcess: string;
  internDates: string;         // free text e.g. "8/24-9/4"
  location: string;
  notes: string;
  status: Status;
  memo: string;
}
