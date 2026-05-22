import type { Status } from '../types';

const colors: Record<Status, string> = {
  '未応募': 'bg-gray-100 text-gray-600',
  '応募済み': 'bg-blue-100 text-blue-700',
  '選考中': 'bg-yellow-100 text-yellow-700',
  '参加確定': 'bg-green-100 text-green-700',
  '辞退': 'bg-orange-100 text-orange-600',
  '不合格': 'bg-red-100 text-red-600',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}
