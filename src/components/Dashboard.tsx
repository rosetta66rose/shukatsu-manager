import { useMemo } from 'react';
import { Plus, Building2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Company, Status } from '../types';
import { formatDeadline, daysUntil } from '../utils/date';

interface Props {
  companies: Company[];
  onEdit: (company: Company) => void;
  onAdd: () => void;
  onUpdateStatus: (id: string, status: Status) => void;
}

const STATUSES: Status[] = ['未応募', '応募済み', '選考中', '参加確定', '辞退', '不合格'];

export function Dashboard({ companies, onEdit, onAdd, onUpdateStatus }: Props) {
  const stats = useMemo(() => ({
    total: companies.length,
    confirmed: companies.filter(c => c.status === '参加確定').length,
    applied: companies.filter(c => c.status === '応募済み' || c.status === '選考中').length,
    urgent: companies.filter(c => {
      if (!c.deadline) return false;
      const d = daysUntil(c.deadline);
      return d !== null && d >= 0 && d <= 7 && c.status === '未応募';
    }).length,
  }), [companies]);

  const sorted = useMemo(() =>
    [...companies].sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }),
    [companies]
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">就活管理ダッシュボード</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          企業を追加
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Building2 size={20} className="text-blue-600" />} label="登録企業数" value={stats.total} color="blue" />
        <StatCard icon={<Clock size={20} className="text-yellow-600" />} label="締切7日以内" value={stats.urgent} color="yellow" />
        <StatCard icon={<AlertCircle size={20} className="text-orange-600" />} label="応募・選考中" value={stats.applied} color="orange" />
        <StatCard icon={<CheckCircle size={20} className="text-green-600" />} label="参加確定" value={stats.confirmed} color="green" />
      </div>

      {/* Company list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">企業名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ステータス</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">応募締切</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">選考内容</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">場所</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map(company => {
                const days = company.deadline ? daysUntil(company.deadline) : null;
                const isUrgent = days !== null && days >= 0 && days <= 3;
                const isPast = days !== null && days < 0;

                return (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{company.name}</div>
                      {company.notes && (
                        <div className="text-xs text-gray-400 mt-0.5">{company.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={company.status}
                        onChange={e => onUpdateStatus(company.id, e.target.value as Status)}
                        className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {company.deadline ? (
                        <div>
                          <div className={`font-medium ${isUrgent ? 'text-red-600' : isPast ? 'text-gray-400' : 'text-gray-700'}`}>
                            {formatDeadline(company.deadline)}
                          </div>
                          {days !== null && days >= 0 && (
                            <div className={`text-xs mt-0.5 ${isUrgent ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                              あと{days}日
                            </div>
                          )}
                          {isPast && <div className="text-xs text-gray-400">締切済み</div>}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      {company.selectionProcess || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {company.location || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onEdit(company)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        詳細・編集
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'yellow' | 'orange' | 'green';
}) {
  const bg = { blue: 'bg-blue-50', yellow: 'bg-yellow-50', orange: 'bg-orange-50', green: 'bg-green-50' }[color];
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-medium text-gray-500">{label}</span></div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
