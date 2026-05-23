import { LayoutDashboard, Calendar, Bell, LogOut, CalendarCheck, CalendarX } from 'lucide-react';

interface Props {
  view: 'dashboard' | 'calendar';
  onChangeView: (v: 'dashboard' | 'calendar') => void;
  onNotification: () => void;
  onSignOut: () => void;
  gcalConnected: boolean;
  gcalSyncing: boolean;
  onReconnectGcal: () => void;
}

export function BottomNav({ view, onChangeView, onNotification, onSignOut, gcalConnected, gcalSyncing, onReconnectGcal }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex md:hidden z-40">
      <NavBtn icon={<LayoutDashboard size={20} />} label="ダッシュボード" active={view === 'dashboard'} onClick={() => onChangeView('dashboard')} />
      <NavBtn icon={<Calendar size={20} />} label="カレンダー" active={view === 'calendar'} onClick={() => onChangeView('calendar')} />
      <NavBtn
        icon={gcalConnected
          ? <CalendarCheck size={20} />
          : <CalendarX size={20} />}
        label={gcalConnected ? (gcalSyncing ? '同期中…' : 'GCal連携') : 'GCal接続'}
        active={false}
        onClick={gcalConnected ? () => {} : onReconnectGcal}
        highlight={gcalConnected}
        warning={!gcalConnected}
      />
      <NavBtn icon={<Bell size={20} />} label="通知" active={false} onClick={onNotification} />
      <NavBtn icon={<LogOut size={20} />} label="ログアウト" active={false} onClick={onSignOut} danger />
    </nav>
  );
}

function NavBtn({ icon, label, active, onClick, danger, highlight, warning }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
  highlight?: boolean;
  warning?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
        danger     ? 'text-red-400 hover:text-red-600'
        : highlight ? 'text-green-600'
        : warning   ? 'text-orange-500 hover:text-orange-700'
        : active    ? 'text-blue-600'
        : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
