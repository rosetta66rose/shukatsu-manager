import { useMemo, useState } from 'react';
import { Plus, Building2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Company, Status } from '../types';
import { INTERN_STATUSES, HONSEN_STATUSES } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatDeadline, daysUntil } from '../utils/date';

interface Props {
  companies: Company[];
  onEdit: (company: Company) => void;
  onAdd: () => void;
  onUpdateStatus: (id: string, status: Status) => void;
}

type Filter = '全て' | 'インターン' | '本選考';

export function Dashboard({ companies, onEdit, onAdd, onUpdateStatus }: Props) {
  const [filter, setFilter] = useState<Filter>('全て');

  const filtered = useMemo(() =>
    filter === '全て' ? companies : companies.filter(c => c.type === filter),
    [companies, filter]
  );

  const stats = useMemo(() => ({
    total: filtered.length,
    urgent: filtered.filter(c => {
      if (!c.deadline) return false;
      const d = daysUntil(c.deadline);
      return d !== null && d >= 0 && d <= 7 && c.status === '未応募';
    }).length,
    active: filtered.filter(c =>
      ['応募済み', '選考中', 'ES通過', '一次面接', '二次面接', '最終面接'].includes(c.status)
    ).length,
    goal: filtered.filter(c => c.status === '参加確定' || c.status === '内定').length,
  }), [filtered]);

  const goalLabel = filter === '本選考' ? '内定' : filter === 'インターン' ? '参加確定' : '内定/参加確定';

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />企業を追加
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 md:mb-6">
        {(['全て', 'インターン', '本選考'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? f === '本選考' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
            <span className="ml-1 text-xs opacity-75">
              {f === '全て' ? companies.length : companies.filter(c => c.type === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={<Building2 size={18} className="text-blue-600" />}     label="企業数"      value={stats.total}  color="blue" />
        <StatCard icon={<Clock size={18} className="text-yellow-600" />}       label="締切7日以内" value={stats.urgent} color="yellow" />
        <StatCard icon={<AlertCircle size={18} className="text-orange-600" />} label="選考中"      value={stats.active} color="orange" />
        <StatCard icon={<CheckCircle size={18} className="text-green-600" />}  label={goalLabel}   value={stats.goal}   color="green" />
      </div>

      {/* スマホ: カード表示 */}
      <div className="md:hidden space-y-3">
        {filtered.map(company => (
          <CompanyCard
            key={company.id}
            company={company}
            onEdit={onEdit}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>

      {/* PC: テーブル表示 */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">種別</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">企業名</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ステータス</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">応募締切</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">選考内容</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">場所</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(company => {
                const days = company.deadline ? daysUntil(company.deadline) : null;
                const isUrgent = days !== null && days >= 0 && days <= 3;
                const isPast = days !== null && days < 0;
                const statuses = company.type === '本選考' ? HONSEN_STATUSES : INTERN_STATUSES;
                return (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${company.type === '本選考' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {company.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{company.name}</div>
                      {company.notes && <div className="text-xs text-gray-400 mt-0.5">{company.notes}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={company.status}
                        onChange={e => onUpdateStatus(company.id, e.target.value as Status)}
                        className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {statuses.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {company.deadline ? (
                        <div>
                          <div className={`font-medium ${isUrgent ? 'text-red-600' : isPast ? 'text-gray-400' : 'text-gray-700'}`}>{formatDeadline(company.deadline)}</div>
                          {days !== null && days >= 0 && <div className={`text-xs mt-0.5 ${isUrgent ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>あと{days}日</div>}
                          {isPast && <div className="text-xs text-gray-400">締切済み</div>}
                        </div>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">{company.selectionProcess || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-gray-600">{company.location || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => onEdit(company)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">詳細・編集</button>
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

function CompanyCard({ company, onEdit, onUpdateStatus }: {
  company: Company;
  onEdit: (c: Company) => void;
  onUpdateStatus: (id: string, status: Status) => void;
}) {
  const days = company.deadline ? daysUntil(company.deadline) : null;
  const isUrgent = days !== null && days >= 0 && days <= 3;
  const isPast = days !== null && days < 0;
  const statuses = company.type === '本選考' ? HONSEN_STATUSES : INTERN_STATUSES;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4" onClick={() => onEdit(company)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${company.type === '本選考' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {company.type}
          </span>
          <span className="font-semibold text-gray-900">{company.name}</span>
        </div>
        <StatusBadge status={company.status} />
      </div>

      {company.deadline && (
        <div className={`text-sm mb-2 ${isUrgent ? 'text-red-600 font-semibold' : isPast ? 'text-gray-400' : 'text-gray-600'}`}>
          📅 {formatDeadline(company.deadline)}
          {days !== null && days >= 0 && <span className="ml-1 text-xs">（あと{days}日）</span>}
          {isPast && <span className="ml-1 text-xs">締切済み</span>}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3" onClick={e => e.stopPropagation()}>
        <select
          value={company.status}
          onChange={e => onUpdateStatus(company.id, e.target.value as Status)}
          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        {company.location && <span className="text-xs text-gray-400 truncate">📍{company.location}</span>}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number; color: 'blue' | 'yellow' | 'orange' | 'green';
}) {
  const bg = { blue: 'bg-blue-50', yellow: 'bg-yellow-50', orange: 'bg-orange-50', green: 'bg-green-50' }[color];
  return (
    <div className={`${bg} rounded-xl p-3 md:p-4`}>
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-xs font-medium text-gray-500">{label}</span></div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
