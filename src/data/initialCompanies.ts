import type { Company } from '../types';

export const initialCompanies: Company[] = [
  {
    id: '1',
    name: '株式会社サンプル',
    deadline: '2026-06-30T23:59:00',
    selectionProcess: '適性検査(SPI)・ES',
    internDates: '8/24-9/4',
    location: '東京',
    notes: '',
    status: '未応募',
    memo: '',
  },
  {
    id: '2',
    name: 'サンプル工業株式会社',
    deadline: '2026-07-15T23:59:00',
    selectionProcess: 'ESのみ',
    internDates: '8/17-8/21',
    location: '大阪',
    notes: '書類選考後に適性検査',
    status: '応募済み',
    memo: 'OB訪問済み',
  },
  {
    id: '3',
    name: 'サンプルテック',
    deadline: null,
    selectionProcess: '',
    internDates: '9/1-9/5',
    location: '愛知',
    notes: '参加確定済み',
    status: '参加確定',
    memo: '',
  },
];
