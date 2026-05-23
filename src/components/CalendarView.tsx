import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import { useMemo, useState } from 'react';
import type { EventClickArg } from '@fullcalendar/core';
import type { Company } from '../types';
import { parseEventDates } from '../utils/date';

interface Props {
  companies: Company[];
  onEdit: (company: Company) => void;
}

const STATUS_COLORS: Record<string, string> = {
  '未応募':   '#6366f1',
  '応募済み': '#3b82f6',
  'ES通過':   '#06b6d4',
  '一次面接': '#f59e0b',
  '二次面接': '#f97316',
  '最終面接': '#a855f7',
  '選考中':   '#f59e0b',
  '参加確定': '#22c55e',
  '内定':     '#16a34a',
  '辞退':     '#9ca3af',
  '不合格':   '#ef4444',
};


export function CalendarView({ companies, onEdit }: Props) {
  const [tooltip, setTooltip] = useState<{ company: Company; x: number; y: number } | null>(null);

  const events = useMemo(() => {
    const evts: object[] = [];
    companies.forEach(company => {
      const isHonsen = company.type === '本選考';

      // 締切イベント
      if (company.deadline) {
        evts.push({
          id: `deadline-${company.id}`,
          title: `${isHonsen ? '📝' : '📋'} ${company.name} 締切`,
          date: company.deadline.slice(0, 10),
          backgroundColor: STATUS_COLORS[company.status] ?? '#6366f1',
          borderColor: STATUS_COLORS[company.status] ?? '#6366f1',
          extendedProps: { companyId: company.id },
        });
      }

      // 参加日 / 面接日イベント
      if (company.eventDates) {
        const confirmed = isHonsen
          ? company.status === '内定'
          : company.status === '参加確定';
        // 確定済み: 濃い色 / 未確定: 薄い色
        const color = isHonsen
          ? confirmed ? '#7c3aed' : '#c084fc'
          : confirmed ? '#16a34a' : '#86efac';
        const textColor = confirmed ? '#ffffff' : '#374151';
        parseEventDates(company.eventDates).forEach((d, i) => {
          evts.push({
            id: `event-${company.id}-${i}`,
            title: `${confirmed ? (isHonsen ? '🎉' : '✅') : (isHonsen ? '🤝' : '🏢')} ${company.name}`,
            start: d.start,
            ...(d.end ? { end: d.end } : {}),
            backgroundColor: color,
            borderColor: color,
            textColor,
            extendedProps: { companyId: company.id },
          });
        });
      }
    });
    return evts;
  }, [companies]);

  const handleEventClick = (info: EventClickArg) => {
    const companyId = info.event.extendedProps['companyId'] as string;
    const company = companies.find(c => c.id === companyId);
    if (company) setTooltip({ company, x: info.jsEvent.clientX, y: info.jsEvent.clientY });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto" onClick={() => setTooltip(null)}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">カレンダー</h1>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-600">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />{status}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#86efac' }} />参加日（未確定）
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#16a34a' }} />✅ 参加確定
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#c084fc' }} />面接日（未内定）
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#7c3aed' }} />🎉 内定
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={jaLocale}
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth' }}
          height="auto"
        />
      </div>

      {tooltip && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-72"
          style={{ left: Math.min(tooltip.x + 12, window.innerWidth - 300), top: Math.min(tooltip.y + 12, window.innerHeight - 260) }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              tooltip.company.type === '本選考' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>{tooltip.company.type}</span>
            <span className="font-semibold text-gray-900">{tooltip.company.name}</span>
          </div>
          <div className="text-sm space-y-1 text-gray-600">
            {tooltip.company.deadline && <div><span className="font-medium">締切:</span> {new Date(tooltip.company.deadline).toLocaleString('ja-JP')}</div>}
            {tooltip.company.selectionProcess && <div><span className="font-medium">選考:</span> {tooltip.company.selectionProcess}</div>}
            {tooltip.company.eventDates && <div><span className="font-medium">{tooltip.company.type === '本選考' ? '面接日' : '参加日'}:</span> {tooltip.company.eventDates}</div>}
            {tooltip.company.location && <div><span className="font-medium">場所:</span> {tooltip.company.location}</div>}
            {tooltip.company.memo && <div className="mt-2 p-2 bg-gray-50 rounded text-xs">{tooltip.company.memo}</div>}
          </div>
          <button
            onClick={() => { onEdit(tooltip.company); setTooltip(null); }}
            className="mt-3 w-full py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}
