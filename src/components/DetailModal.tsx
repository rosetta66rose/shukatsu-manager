import { X, Trash2, Edit3 } from 'lucide-react';
import type { Company, Status } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatDeadline, daysUntil } from '../utils/date';

interface Props {
  company: Company;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateMemo: (memo: string) => void;
  onUpdateStatus: (status: Status) => void;
}

const STATUSES: Status[] = ['未応募', '応募済み', '選考中', '参加確定', '辞退', '不合格'];

export function DetailModal({ company, onClose, onEdit, onDelete, onUpdateMemo, onUpdateStatus }: Props) {
  const days = company.deadline ? daysUntil(company.deadline) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">{company.name}</h2>
            <StatusBadge status={company.status} />
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">ステータス変更</label>
            <select
              value={company.status}
              onChange={e => onUpdateStatus(e.target.value as Status)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {company.deadline && (
            <InfoRow label="応募締切">
              <span className={`font-medium ${days !== null && days <= 3 && days >= 0 ? 'text-red-600' : 'text-gray-800'}`}>
                {formatDeadline(company.deadline)}
              </span>
              {days !== null && days >= 0 && (
                <span className={`ml-2 text-xs ${days <= 3 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                  (あと{days}日)
                </span>
              )}
              {days !== null && days < 0 && <span className="ml-2 text-xs text-gray-400">(締切済み)</span>}
            </InfoRow>
          )}

          {company.selectionProcess && <InfoRow label="選考内容">{company.selectionProcess}</InfoRow>}
          {company.internDates && <InfoRow label="インターン開催日">{company.internDates}</InfoRow>}
          {company.location && <InfoRow label="場所">{company.location}</InfoRow>}
          {company.notes && <InfoRow label="備考">{company.notes}</InfoRow>}

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">メモ</label>
            <textarea
              defaultValue={company.memo}
              onBlur={e => onUpdateMemo(e.target.value)}
              rows={4}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="自由メモを入力..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />削除
            </button>
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={14} />編集
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="mt-1 text-sm text-gray-800">{children}</div>
    </div>
  );
}
